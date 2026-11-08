"""Structured extraction for scientific PDFs.

Reads one PDF and prints a JSON document with:
  title, pages, bodySize,
  sections: [{level, heading, page, paragraphs: [{text, page}]}],
  figures / tables: [{label, caption, page}],
  references: [{raw, year, doi}],
  stats, documentId, coordinateSystem, pageGeometry

All extracted entities retain their legacy fields and include a verified
line-level anchor. ``bbox`` is crop-relative unrotated MuPDF points; ``pdfBBox``
is original PDF user space, suitable for PDF.js viewport conversion. Visual
segments must be rendered independently (never fill the inter-column gutter).

Only PyMuPDF is required. Designed to be spawned by the plugin host.
"""

import hashlib
import json
import math
import re
import sys
import unicodedata
from collections import Counter

PARSER_VERSION = 6

try:
    import pymupdf as fitz
except ImportError:  # Older host environments still expose the fitz name only.
    import fitz

TERMINAL = re.compile(r"[.。!！?？;；:：,，]$")
NUMBERED = re.compile(r"^((?:\d+|[IVX]+|[A-Z])(?:\.\d+)*)[.)、]?\s+\S")
CN_NUMBERED = re.compile(r"^(第[一二三四五六七八九十百]+[章节]|[一二三四五六七八九十]+、)\s*\S")
CAPTION = re.compile(r"^(figure|fig\.?|table|图|表)\s*([A-Z]?\d+[a-z]?|[IVX]+)(?=\s|[.:：、\-]|[\u4e00-\u9fff]|$)", re.IGNORECASE)
REFERENCE_START = re.compile(r"^\s*(?:\[(\d+)\]\s*|(\d+)[.)](?:\s+|$))")
REFERENCE_HEADING = re.compile(r"^(?:(?:\d+(?:\.\d+)*[.)]?|[IVXLCDM]+\.)\s+)?(?:references|bibliography|参\s*考\s*文\s*献)(?:\s*[（(]\s*references\s*[）)])?\s*[:：]?$", re.IGNORECASE)


def rounded_rect(rect):
    return [round(float(value), 3) for value in rect]


def document_fingerprint(path):
    digest = hashlib.sha256()
    with open(path, "rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return "pdf-" + digest.hexdigest()


def page_geometry(doc):
    """Text extraction uses unrotated, crop-relative MuPDF points.

    Read the PDF transform at rotation zero: some MuPDF versions omit crop
    offsets from transformation_matrix on rotated pages. Only this in-memory
    document is touched and the original rotation is restored immediately.
    """
    geometry = []
    for pno, page in enumerate(doc):
        rotation = page.rotation
        displayed = rounded_rect(page.rect)
        try:
            if rotation:
                page.set_rotation(0)
            matrix = page.transformation_matrix
            width, height = page.rect.width, page.rect.height
        finally:
            if rotation:
                page.set_rotation(rotation)
        rotate_matrix = {
            0: [1, 0, 0, 1, 0, 0], 90: [0, 1, -1, 0, height, 0],
            180: [-1, 0, 0, -1, width, height], 270: [0, -1, 1, 0, 0, width],
        }[rotation]
        geometry.append({
            "page": pno, "width": round(width, 3), "height": round(height, 3),
            "rotation": rotation, "displayBounds": displayed,
            "mediaBox": rounded_rect(page.mediabox), "cropBox": rounded_rect(page.cropbox),
            "pdfToPage": [round(float(value), 9) for value in matrix],
            "pageToPdf": [round(float(value), 9) for value in ~matrix],
            "pageToDisplay": [round(float(value), 9) for value in rotate_matrix],
        })
    return geometry


def source_key(value):
    return re.sub(r"[\s\u00ad\u200b-\u200f\u2060\ufeff]+", "", unicodedata.normalize("NFKC", value or "")).lower()


def make_anchor(kind, lines, quote, document_id, geometry, precision="line"):
    source_lines = []
    seen = set()
    # Classification may compose a short heading from PDF fragments. Its
    # anchor must still contain the original independent source-line boxes.
    expanded = [source for line in lines for source in line.get("_sourceLines", [line])]
    for line in expanded:
        if line.get("id") in seen:
            continue
        seen.add(line.get("id"))
        source_lines.append(line)
    identity = "|".join([document_id, kind, *(line.get("id", "") for line in source_lines), norm(quote)])
    anchor_id = kind + "-" + hashlib.sha256(identity.encode()).hexdigest()[:20]
    segments = []
    for line in source_lines:
        pno = line.get("page")
        if not isinstance(pno, int) or not 0 <= pno < len(geometry):
            continue
        box = line.get("bbox") or [line["x0"], line["y0"], line["x1"], line["y1"]]
        if len(box) != 4 or not all(math.isfinite(float(value)) for value in box):
            continue
        g = geometry[pno]
        clipped = fitz.Rect(box) & fitz.Rect(0, 0, g["width"], g["height"])
        if clipped.is_empty or clipped.is_infinite:
            continue
        pdf_box = clipped * fitz.Matrix(g["pageToPdf"])
        segments.append({
            "page": pno, "bbox": rounded_rect(clipped), "pdfBBox": rounded_rect(pdf_box),
            "lineIds": [line["id"]], "quote": line.get("sourceText", line["text"]),
            "clipped": rounded_rect(clipped) != rounded_rect(box),
        })
    source_text = norm(" ".join(line.get("sourceText", line["text"]) for line in source_lines))
    match = bool(quote) and source_key(quote) in source_key(source_text)
    status = "located" if segments and len(segments) == len(source_lines) and match else "partial" if segments else "unavailable"
    first = segments[0] if segments else {}
    return {
        "id": anchor_id, "documentId": document_id, "target": kind,
        "status": status, "precision": precision,
        "coordinateSystem": "mupdf-unrotated-crop-pt-v1",
        "page": first.get("page"), "bbox": first.get("bbox"), "pdfBBox": first.get("pdfBBox"),
        "bboxScope": "first-line", "segments": segments,
        "quote": quote, "sourceText": source_text, "quoteVerified": match,
        "reason": "" if status == "located" else "missing-or-partial-source-geometry" if segments else "no-source-text-geometry",
    }


def attach_anchor(entry, kind, lines, quote, document_id, geometry, preserve_id=False):
    anchor = make_anchor(kind, lines, quote, document_id, geometry)
    if not preserve_id:
        entry["id"] = anchor["id"]
    entry.update({"anchorId": anchor["id"], "bbox": anchor["bbox"], "pdfBBox": anchor["pdfBBox"], "anchor": anchor})
    return entry


def norm(value):
    return re.sub(r"\s+", " ", value or "").strip()


def span_text(spans):
    """Keep source spacing; repair only adjacent initial/small-cap span joins.

    Small caps often use a full-height initial followed by 80%-height capital
    glyphs. Some extractors insert a word space at that font-size transition.
    A real inter-word space is retained unless a single initial and its smaller
    suffix are geometrically adjacent. This is heading-only normalization: the
    source text and coordinates used for anchors are never rewritten.
    """
    letters = "".join(re.findall(r"[A-Za-z]", "".join(span.get("text", "") for span in spans)))
    sizes = [float(span.get("size", 0)) for span in spans if re.search(r"[A-Za-z]", span.get("text", ""))]
    small_caps = bool(letters and letters.isupper() and sizes and max(sizes) > 0 and .6 <= min(sizes) / max(sizes) <= .86)
    pieces, heading_pieces = [], []
    previous = None
    for span in spans:
        piece = span.get("text", "")
        if not piece:
            continue
        add_space = False
        join_caps = False
        if previous is not None:
            gap = span.get("bbox", (0, 0, 0, 0))[0] - previous.get("bbox", (0, 0, 0, 0))[2]
            prev_text = previous.get("text", "")
            glued = bool(prev_text) and prev_text[-1].islower() and piece[:1].isupper()
            add_space = (gap > .6 or glued) and not prev_text.endswith(" ") and not piece.startswith(" ")
            join_caps = bool(small_caps and re.search(r"(?:^|\s)[A-Z]$", prev_text) and
                             re.match(r"\s*[A-Z]{2,}", piece) and
                             float(previous.get("size", 0)) >= float(span.get("size", 0)) * 1.12 and
                             -.3 <= gap <= max(1.2, float(previous.get("size", 0)) * .12))
        if add_space:
            pieces.append(" ")
        if add_space and not join_caps:
            heading_pieces.append(" ")
        pieces.append(piece)
        if join_caps:
            if heading_pieces:
                heading_pieces[-1] = heading_pieces[-1].rstrip()
            heading_pieces.append(piece.lstrip())
        else:
            heading_pieces.append(piece)
        previous = span
    return norm("".join(pieces)), norm("".join(heading_pieces)), small_caps


def chinese_blackface(font):
    """Narrow aliases verified from source PDFs, not all Chinese fonts."""
    value = re.sub(r"^[A-Z]{6}\+", "", str(font or ""))
    return bool(re.search(r"simhei|heiti|黑体", value, re.IGNORECASE) or
                re.match(r"^FZHTK(?:--|-|$)", value, re.IGNORECASE))


def font_is_bold(font, flags=0):
    return bool(re.search(r"bold|semibold", str(font), re.IGNORECASE) or
                int(flags) & 16)


def collect_lines(doc):
    pages = []
    for pno, page in enumerate(doc):
        height = (page.rect.width if page.rotation % 180 else page.rect.height) or 1
        width = (page.rect.height if page.rotation % 180 else page.rect.width) or 1
        data = page.get_text("dict")
        graphic_boxes = []
        horizontal_rules = []
        try:
            for drawing in page.get_drawings():
                box = drawing.get("rect")
                if drawing.get("fill") is not None and box and 4 < box.height < 60 and 15 < box.width < width * .75:
                    graphic_boxes.append(box)
                if box and box.height <= 1.5 and box.width >= width * .2 and drawing.get("type") in ("s", "fs"):
                    horizontal_rules.append(rounded_rect(box))
        except (RuntimeError, ValueError):
            pass
        lines = []
        for bno, block in enumerate(data.get("blocks", [])):
            if block.get("type") != 0:
                continue
            for lno, line in enumerate(block.get("lines", [])):
                spans = line.get("spans", [])
                if not spans:
                    continue
                text, heading_text, small_caps = span_text(spans)
                if not text:
                    continue
                size = max(float(span.get("size", 0)) for span in spans)
                bold = any(font_is_bold(span.get("font", ""), span.get("flags", 0)) for span in spans)
                weights = Counter()
                fonts = Counter()
                total_weight = bold_weight = italic_weight = 0
                for span in spans:
                    weight = len(span.get("text", "").strip())
                    if not weight:
                        continue
                    font = re.sub(r"^[A-Z]{6}\+", "", str(span.get("font", "")))
                    flags = int(span.get("flags", 0))
                    total_weight += weight
                    weights[round(float(span.get("size", 0)), 2)] += weight
                    fonts[font] += weight
                    if font_is_bold(font, flags):
                        bold_weight += weight
                    if "italic" in font.lower() or re.search(r"(?:Italic|Oblique|SemiboldIt)$", font) or flags & 2:
                        italic_weight += weight
                x0, y0, x1, y1 = line.get("bbox", (0, 0, 0, 0))
                if (x1 - x0) < 42 and (y1 - y0) > 90:
                    continue
                lines.append(
                    {
                        "text": text,
                        "sourceText": text,
                        "_headingText": heading_text,
                        "_smallCaps": small_caps,
                        "id": f"p{pno + 1}-b{bno}-l{lno}",
                        "blockId": f"p{pno + 1}-b{bno}",
                        "bbox": rounded_rect((x0, y0, x1, y1)),
                        "size": round(size, 2),
                        "bold": bool(bold),
                        "dominantSize": weights.most_common(1)[0][0] if weights else round(size, 2),
                        "font": fonts.most_common(1)[0][0] if fonts else "",
                        "boldRatio": round(bold_weight / max(total_weight, 1), 3),
                        "italicRatio": round(italic_weight / max(total_weight, 1), 3),
                        "leadingBold": bool(spans and font_is_bold(spans[0].get("font", ""), spans[0].get("flags", 0))),
                        "_pageHorizontalRules": horizontal_rules,
                        "_boxedGraphicText": any(box.contains(fitz.Point((x0 + x1) / 2, (y0 + y1) / 2)) and
                                                  (fitz.Rect(x0, y0, x1, y1) & box).get_area() >= max(1, (x1 - x0) * (y1 - y0)) * .6
                                                  for box in graphic_boxes),
                        "x0": round(x0, 1),
                        "y0": round(y0, 1),
                        "x1": round(x1, 1),
                        "y1": round(y1, 1),
                        "page": pno,
                        "relativeY": y0 / height,
                    }
                )
        pages.append(lines)
    return pages


def compose_short_chinese_headings(pages):
    """Compose only exact known headings split into same-block glyph lines.

    Source fragments remain independent through _sourceLines. Normal body
    words, table cells and merely adjacent lines are never joined here.
    """
    out = []
    for lines in pages:
        result = []
        index = 0
        while index < len(lines):
            first = lines[index]
            group = [first]
            if re.fullmatch(r"[\d.、\s\u4e00-\u9fff]{1,8}", first["text"]):
                for follow in lines[index + 1:index + 6]:
                    previous = group[-1]
                    same_row = abs((follow["y0"] + follow["y1"]) / 2 - (first["y0"] + first["y1"]) / 2) <= max(2.5, first["size"] * .3)
                    gap = follow["x0"] - previous["x1"]
                    if not (follow.get("blockId") == first.get("blockId") and same_row and
                            re.fullmatch(r"[\u4e00-\u9fff]{1,8}", follow["text"]) and
                            -.3 <= gap <= first["size"] * 1.5 and
                            abs(follow["size"] - first["size"]) <= .6):
                        break
                    group.append(follow)
            if len(group) > 1:
                source = norm(" ".join(item["text"] for item in group))
                heading = re.sub(r"(?<=[\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])", "", source)
                tail = re.sub(r"^\d+[.)、]?\s+", "", heading)
                if REFERENCE_HEADING.fullmatch(heading) or MAIN_HEADINGS.fullmatch(tail):
                    box = fitz.Rect(group[0]["bbox"])
                    for part in group[1:]:
                        box |= fitz.Rect(part["bbox"])
                    merged = {**first, "text": source, "sourceText": source, "_headingText": heading,
                              "_sourceLines": group, "bbox": rounded_rect(box),
                              "x0": round(box.x0, 1), "y0": round(box.y0, 1), "x1": round(box.x1, 1), "y1": round(box.y1, 1)}
                    result.append(merged)
                    index += len(group)
                    continue
            result.append(first)
            index += 1
        out.append(result)
    return out


SECTION_LABEL = re.compile(r"(?:\d+|[IVX]+|[A-Z])(?:\.\d+)*[.)、]?")


def same_row_heading_label(line, follow):
    """A literal source label and title with compatible same-row typography."""
    if not follow or not SECTION_LABEL.fullmatch(classification_text(line["text"])):
        return False
    title = line_heading_text(follow)
    return bool(line.get("blockId") == follow.get("blockId") and
                abs((follow["y0"] + follow["y1"]) / 2 - (line["y0"] + line["y1"]) / 2) <= max(2, line["size"] * .25) and
                follow["x0"] > line["x0"] and follow["x0"] - line["x1"] <= line["size"] * 3 and
                abs(follow["size"] - line["size"]) <= .6 and 2 <= len(title) <= 110 and
                not TERMINAL.search(title) and (title[:1].isupper() or re.match(r"[\u4e00-\u9fff]", title)) and
                (follow.get("_smallCaps") or line.get("boldRatio", 0) >= .7 and follow.get("boldRatio", 0) >= .7))


def drop_running_headers(pages):
    protected = set()
    for lines in pages:
        for line, follow in zip(lines, lines[1:]):
            if .03 <= line["relativeY"] < .88 and same_row_heading_label(line, follow):
                protected.update((line["id"], follow["id"]))
            # A page-top bibliography number can occupy its own span beside
            # the first author's line. Repeated digits alone are not a header.
            if (line["relativeY"] <= .12 and line.get("blockId") == follow.get("blockId")
                    and re.fullmatch(r"\d{1,3}[.)]", line["text"])
                    and follow["x0"] > line["x1"]
                    and abs(follow["y0"] - line["y0"]) <= max(1, line["size"] * .3)
                    and len(follow["text"]) >= 20):
                protected.add(line["id"])
    counter = Counter()
    for lines in pages:
        seen = set()
        for line in lines:
            if line["relativeY"] <= 0.12 or line["relativeY"] >= 0.94:
                key = re.sub(r"\d+", "#", line["text"])[:60]
                if key not in seen:
                    seen.add(key)
                    counter[key] += 1
    noisy = {key for key, count in counter.items() if count >= 3}
    cleaned = []
    for lines in pages:
        cleaned.append(
            [
                line
                for line in lines
                if not (
                    (line["relativeY"] <= 0.12 or line["relativeY"] >= 0.94)
                    and re.sub(r"\d+", "#", line["text"])[:60] in noisy
                    and line["id"] not in protected
                    and not REFERENCE_HEADING.match(line_heading_text(line))
                )
            ]
        )
    return cleaned


def left_margin(pages, base):
    xs = []
    for lines in pages:
        for line in lines:
            if line["relativeY"] <= 0.06 or line["relativeY"] >= 0.94:
                continue
            if line["size"] <= base * 1.05 and len(line["text"]) > 30:
                xs.append(line["x0"])
    if not xs:
        return 0
    xs.sort()
    return xs[max(0, int(len(xs) * 0.1))]


def body_size(pages):
    counter = Counter()
    for lines in pages:
        for line in lines:
            if line["relativeY"] <= 0.06 or line["relativeY"] >= 0.94:
                continue
            counter[round(line.get("dominantSize", line["size"]) * 2) / 2] += len(line["text"])
    if not counter:
        return 10.0
    return counter.most_common(1)[0][0]


def split_runin(text):
    match = re.match(r"^((?:\d+|[IVX]+)(?:\.\d+)+)\s+([^.。:：]{3,80})[.:：]\s+(.{8,})$", text)
    if match:
        return match.group(1) + " " + match.group(2).strip() + ".", match.group(3)
    return None, None


def classification_text(value):
    text = re.sub(r"[\u00ad\u200b-\u200f\u2060\ufeff]", "", norm(value))
    # Classification only: preserve source text/coordinates unchanged. Some
    # CJK publishers insert whitespace inside decimal section labels.
    return re.sub(r"^(\d{1,2}(?:\s*\.\s*\d{1,2}){1,3})\s+(?=[\u4e00-\u9fff])",
                  lambda hit: re.sub(r"\s+", "", hit.group(1)) + " ", text)


def line_heading_text(line):
    return classification_text(line.get("_headingText", line["text"]))


ROMAN_HEADING = re.compile(r"^([IVXLCDM]{1,8})\.\s+(.+)$")
ALPHA_HEADING = re.compile(r"^([A-Z])\.\s+(.+)$")
PAREN_HEADING = re.compile(r"^(\d{1,2})\)\s+(.+)$")


def roman_number(token):
    """Reject dotted abbreviations and non-canonical Roman numeral strings."""
    if not token or not re.fullmatch(r"M{0,3}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})", token):
        return None
    numbers = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    return sum(-numbers[char] if index + 1 < len(token) and numbers[char] < numbers[token[index + 1]] else numbers[char]
               for index, char in enumerate(token))


def prepare_heading_numbering(pages, base):
    """Infer IEEE hierarchy from a real, increasing Roman heading sequence.

    A numeral alone is insufficient. Candidates also need standalone heading
    typography and column-local placement. The document-level sequence allows
    centered small caps at 80% dominant size without promoting ordinary list
    items or the authors/initials in a bibliography.
    """
    candidates = []
    for line in (line for lines in pages for line in lines):
        text = line_heading_text(line)
        match = ROMAN_HEADING.fullmatch(text)
        if not match or line.get("_tableCell") or line.get("_boxedGraphicText") or line.get("_contentsEntry"):
            continue
        value, tail = roman_number(match.group(1)), match.group(2)
        if value is None or len(text) > 110 or TERMINAL.search(tail) or re.search(r"[.!?。！？]\s+\S|[=∑∫≤≥]", tail):
            continue
        letters = "".join(re.findall(r"[A-Za-z]", tail))
        capitals = len(letters) >= 3 and letters.isupper()
        strong = line.get("boldRatio", 0) >= .8 or line["size"] >= base * 1.1
        placement = line.get("_columnCentered", False) or line.get("_centered", False) or line.get("_aligned", False) and strong
        isolated = line.get("_blockStart", True) and line.get("_gapBefore", 0) >= max(4, base * .4)
        size_ok = line["size"] >= base * .88 and line.get("dominantSize", line["size"]) >= base * (.65 if line.get("_smallCaps") else .87)
        if placement and isolated and size_ok and (capitals or strong):
            candidates.append((line, value, match.group(1)))
    # Require at least two adjacent, increasing numerals, starting near I.
    # A lone 'I. V. ...' or an emphasized enumeration cannot enable the scheme.
    chains = []
    for index, (_, value, _) in enumerate(candidates):
        chain = [index] if value <= 3 else []
        for previous_index, (_, previous_value, _) in enumerate(candidates[:index]):
            if chains[previous_index] and 0 < value - previous_value <= 3 and len(chains[previous_index]) + 1 > len(chain):
                chain = [*chains[previous_index], index]
        chains.append(chain)
    sequence = max(chains, key=len, default=[])
    values = [candidates[index][1] for index in sequence]
    if len(sequence) < 2 or not any(b == a + 1 for a, b in zip(values, values[1:])):
        return pages
    for index in sequence:
        line, value, label = candidates[index]
        line.update({"_romanMain": True, "_headingLevel": 1, "_headingNumbering": "roman", "_headingLabel": label})
    active = False
    references = False
    for line in (line for lines in pages for line in lines):
        text = line_heading_text(line)
        line["_romanDocument"] = True
        if line.get("_romanMain"):
            active = True
            references = bool(REFERENCE_HEADING.fullmatch(text))
            continue
        if REFERENCE_HEADING.fullmatch(text):
            references = True
        if not active or references:
            continue
        match = ALPHA_HEADING.fullmatch(text)
        if match:
            line.update({"_headingLevel": 2, "_headingNumbering": "alphabetic", "_headingLabel": match.group(1)})
        match = PAREN_HEADING.fullmatch(text)
        if match:
            # IEEE run-in '1) ...: prose' and the production-challenge list are
            # paragraphs. A separate, prominent bold label may be a level-3
            # heading, but never a top-level chapter.
            standalone = (line.get("boldRatio", 0) >= .8 and line.get("dominantSize", line["size"]) >= base * 1.08 and
                          line.get("_gapBefore", 0) >= base * .5 and line.get("_blockStart", True) and
                          not re.search(r"[.:：,，;；]", match.group(2)))
            if standalone:
                line.update({"_headingLevel": 3, "_headingNumbering": "arabic-parenthesized", "_headingLabel": match.group(1)})
    return pages


MAIN_HEADINGS = re.compile(
    r"(?:abstract|摘要|introduction|引言|绪论|related works?|相关工作|background|背景|motivation|"
    r"preliminaries|materials and methods|method(?:s|ology)?|方法|approach|模型|"
    r"experiment(?:s)?|实验|evaluation|评估|results?(?: and discussion)?|结果(?:与讨论)?|analysis|分析|"
    r"discussion|讨论|conclusions?|结论|limitations?|局限|future work|references|bibliography|"
    r"参\s*考\s*文\s*献|appendix(?: [A-Z])?|附录|acknowledg(?:e)?ments?|致谢)", re.IGNORECASE)
OTHER_HEADINGS = re.compile(
    r"(?:experimental setup|experimental results|ablation studies|parameter sensitivity analysis|"
    r"abbreviations|authors?[’']? contributions?|funding|data availability|code availability|"
    r"declarations|competing interests?|ethics(?: statement)?|publisher[’']s note|supplementary information)", re.IGNORECASE)


def ruled_table_cells(lines, base, width):
    """Require a real table caption, horizontal rules and 3+ column cells."""
    rules = lines[0].get("_pageHorizontalRules", []) if lines else []
    captions = [line for line in lines if (match := CAPTION.match(classification_text(line["text"]))) and
                match.group(1).lower() in ("table", "表")]
    found = set()
    for upper in rules:
        near_caption = any(0 <= upper[1] - caption["y0"] <= base * 10 and
                           caption["x0"] <= upper[2] and caption["x1"] >= upper[0] for caption in captions)
        if not near_caption:
            continue
        lowers = [rule for rule in rules if 4 <= rule[1] - upper[1] <= base * 12 and
                  abs(rule[0] - upper[0]) <= 3 and abs(rule[2] - upper[2]) <= 3]
        if not lowers:
            continue
        lower = min(lowers, key=lambda rule: rule[1])
        cells = [line for line in lines if line["y0"] >= upper[1] - 1 and line["y1"] <= lower[1] + 1 and
                 line["x0"] >= upper[0] - 2 and line["x1"] <= upper[2] + 2 and
                 len(line["text"]) <= 32 and line["x1"] - line["x0"] < width * .25]
        centers = []
        for line in sorted(cells, key=lambda item: (item["x0"] + item["x1"]) / 2):
            center = (line["x0"] + line["x1"]) / 2
            if not centers or center - centers[-1] >= base * 2.4:
                centers.append(center)
        if len(centers) >= 3:
            found.update(line["id"] for line in cells)
    return found


def prepare_layout(pages, base, geometry):
    """Record column-local spacing and table-cell evidence before classification.

    The source line IDs and boxes are unchanged. The evidence comes from the
    page, not from a word such as 'Method' or a numeric prefix alone.
    """
    for pno, lines in enumerate(pages):
        width = geometry[pno]["width"]
        ruled_cells = ruled_table_cells(lines, base, width)
        contents_page = any(re.fullmatch(r"table of contents|contents|目\s*录", classification_text(line["text"]), re.IGNORECASE) for line in lines)
        body = [line for line in lines if (len(line["text"]) >= 32 or len(line["text"]) >= 14 and re.search(r"[\u4e00-\u9fff]", line["text"])) and
                base * .88 <= line.get("dominantSize", line["size"]) <= base * 1.08 and
                line["x1"] - line["x0"] >= width * .22 and .05 < line["relativeY"] < .94]
        buckets = []
        for line in sorted(body, key=lambda item: item["x0"]):
            cluster = next((item for item in buckets if abs(item["x"] - line["x0"]) < max(6, base * .75)), None)
            if cluster is None:
                buckets.append({"x": line["x0"], "weight": len(line["text"]), "count": 1})
            else:
                weight = len(line["text"])
                cluster["x"] = (cluster["x"] * cluster["weight"] + line["x0"] * weight) / (cluster["weight"] + weight)
                cluster["weight"] += weight
                cluster["count"] += 1
        clusters = []
        for bucket in sorted(buckets, key=lambda item: item["weight"], reverse=True):
            if all(abs(bucket["x"] - x) > width * .21 for x in clusters):
                clusters.append(bucket["x"])
            if len(clusters) >= 3:
                break
        clusters.sort()
        if not clusters:
            clusters = [min((line["x0"] for line in lines if len(line["text"]) > 12), default=0)]
        column_centers = []
        for start in clusters:
            rights = sorted(line["x1"] for line in body if abs(line["x0"] - start) <= max(12, base * 1.4))
            end = rights[len(rights) // 2] if rights else width
            column_centers.append((start + end) / 2)
        for line in lines:
            line["_contentsEntry"] = contents_page and not re.fullmatch(r"table of contents|contents|目\s*录", classification_text(line["text"]), re.IGNORECASE)
            column = min(range(len(clusters)), key=lambda index: abs(line["x0"] - clusters[index]))
            line["_column"] = column
            line["_aligned"] = abs(line["x0"] - clusters[column]) <= max(10, base)
            line["_centered"] = abs((line["x0"] + line["x1"]) / 2 - width / 2) < max(12, base)
            line["_columnCentered"] = abs((line["x0"] + line["x1"]) / 2 - column_centers[column]) < max(12, base * 1.4)
            peers = [other for other in lines if other is not line and
                     abs((other["y0"] + other["y1"]) / 2 - (line["y0"] + line["y1"]) / 2) < max(2, base * .35) and
                     (other["x0"] >= line["x1"] + 3 or line["x0"] >= other["x1"] + 3) and
                     abs(other.get("dominantSize", other["size"]) - line.get("dominantSize", line["size"])) < 1]
            table_block = any(other.get("blockId") == line.get("blockId") and other["y0"] < line["y0"] and
                              re.match(r"^(?:table|表)\s*[A-Z]?\d", classification_text(other["text"]), re.IGNORECASE) for other in lines)
            same_block_peers = [other for other in peers if other.get("blockId") == line.get("blockId")]
            line["_tableCell"] = line["id"] in ruled_cells or bool((len(same_block_peers) >= 2 or table_block and peers) and len(line["text"]) <= 32 and
                                      line["x1"] - line["x0"] < width * .2 and
                                      same_block_peers)
            same_column = [other for other in lines if other is not line and
                           (abs(other["x0"] - clusters[column]) <= max(12, base * 1.4) or
                            (other["x0"] <= line["x0"] + 2 and other["x1"] >= line["x1"] - 2)) and
                           other["x1"] > line["x0"] + 5 and other["x0"] < line["x1"] + 5]
            previous = [other for other in same_column if other["y0"] < line["y0"] - 1 and other["y1"] <= line["y0"] + 2]
            following = [other for other in same_column if other["y0"] >= line["y1"] - 2]
            prev = max(previous, key=lambda item: item["y1"]) if previous else None
            after = min(following, key=lambda item: item["y0"]) if following else None
            line["_gapBefore"] = max(0, line["y0"] - prev["y1"]) if prev else base * 2
            line["_gapAfter"] = max(0, after["y0"] - line["y1"]) if after else base
            line["_blockStart"] = not any(other is not line and other.get("blockId") == line.get("blockId") and other["y0"] < line["y0"] - 1 for other in lines)
            line["_previousText"] = prev["text"] if prev else ""
    return pages


def reading_order(pages, geometry):
    """Order column-local text around full-width blocks without changing boxes."""
    ordered = []
    for pno, lines in enumerate(pages):
        columns = sorted({line.get("_column", 0) for line in lines})
        if len(columns) < 2:
            ordered.append(lines)
            continue
        width = geometry[pno]["width"]
        starts = {column: min((line["x0"] for line in lines if line.get("_column") == column and line.get("_aligned")), default=width) for column in columns}
        last_start = max(starts.values())
        wide_ids = {line.get("blockId") for line in lines if line["x0"] <= min(starts.values()) + 12 and
                    line["x1"] > last_start + width * .22 and len(line["text"]) >= 35}
        blocks = {}
        for index, line in enumerate(lines):
            key = (line.get("blockId"), -1 if line.get("blockId") in wide_ids else line.get("_column", 0))
            blocks.setdefault(key, []).append((index, line))
        wide = sorted([group for key, group in blocks.items() if key[1] == -1], key=lambda group: min(line["y0"] for _, line in group))
        bands = [[] for _ in range(len(wide) + 1)]
        for key, group in blocks.items():
            if key[1] == -1:
                continue
            top = min(line["y0"] for _, line in group)
            band = sum(top >= max(line["y1"] for _, line in group_wide) - 1 for group_wide in wide)
            bands[band].append(group)
        result = []
        for index, band in enumerate(bands):
            for group in sorted(band, key=lambda group: (group[0][1].get("_column", 0), min(line["y0"] for _, line in group), group[0][0])):
                result.extend(line for _, line in group)
            if index < len(wide):
                result.extend(line for _, line in wide[index])
        ordered.append(result)
    return ordered


def is_heading(line, base, left_margin=0):
    text = line_heading_text(line)
    if line.get("_tableCell") or line.get("_boxedGraphicText") or line.get("_contentsEntry"):
        return False
    if REFERENCE_HEADING.fullmatch(text):
        return line.get("boldRatio", float(line.get("bold", False))) >= .7 or line.get("_gapBefore", base) >= base * .7
    if len(text) > 96 or len(text) < 2:
        return False
    if re.fullmatch(r"(?:\d+|[IVX]+|[A-Z])(?:\.\d+)*[.)、]?", text):
        return False
    if TERMINAL.search(text):
        return False
    if CAPTION.match(text):
        return False
    if line.get("_romanMain"):
        return True
    if line.get("_romanDocument") and PAREN_HEADING.match(text) and line.get("_headingLevel") != 3:
        return False
    size = line.get("dominantSize", line["size"])
    bold = line.get("boldRatio", float(line.get("bold", False))) >= .8 or bool(re.search(r"simhei|heiti|黑体", line.get("font", ""), re.IGNORECASE))
    italic = line.get("italicRatio", 0) >= .8
    aligned = line.get("_aligned", False) or line["x0"] <= left_margin + 30
    gap = line.get("_gapBefore", 0)
    numbered_match = re.match(r"^((?:\d{1,2}|[IVX]{1,6}|[A-Z])(?:\.\d{1,2})*)[.)、]?\s+(.+)$", text)
    numbered = bool(numbered_match or CN_NUMBERED.match(text))
    # A newly known CJK font is evidence for an explicitly numbered heading,
    # not permission to promote every blackface diagram label or step name.
    bold = bold or numbered and not PAREN_HEADING.match(text) and bool(re.search(r"[\u4e00-\u9fff]", text)) and chinese_blackface(line.get("font", ""))
    known = bool(MAIN_HEADINGS.fullmatch(text) or OTHER_HEADINGS.fullmatch(text))
    tail = numbered_match.group(2) if numbered_match else text
    if numbered_match and (re.match(r"^(?:GB|MB|TB|GPUs?|CPUs?|cores?|iterations?|views?|layers?|samples?|parameters?|pixels?|Hz|MHz|GHz|kg|mm|cm|ms|seconds?|minutes?|into|of|and|or|to|from)\b", tail, re.IGNORECASE) or ")" in tail[:12]):
        return False
    if numbered_match and re.fullmatch(r"[A-Z]", numbered_match.group(1)) and line.get("page", 0) == 0 and not line.get("_labelMerged") and line.get("_headingLevel") != 2:
        return False
    if re.search(r"[.!?。！？]\s+\S", tail) or re.search(r"(?:inline|display)[ -]?eq|[=∑∫≤≥]", tail, re.IGNORECASE):
        return False
    if not known and not (tail[:1].isupper() or re.match(r"[\u4e00-\u9fff]|\d+[Dd]\b", tail)):
        return False
    if re.fullmatch(r"abstract|摘要", text, re.IGNORECASE) and bold and size >= base * .85 and (aligned or line.get("_centered")):
        return True
    if not aligned or size < base * .87:
        return False
    # Standalone full-line emphasis is required at body size. A bold word in a
    # prose sentence, a GPU count, or a table column never satisfies this test.
    prominent = size >= base * 1.1
    emphasized = bold or (italic and size >= base * .92)
    isolated = gap >= max(4, base * .5) and line.get("_gapAfter", 0) >= 0
    if numbered:
        chinese_subheading = bool(numbered_match and numbered_match.group(1).count(".") >= 1 and
                                  re.search(r"[\u4e00-\u9fff]", tail) and len(tail) <= 42 and
                                  not re.search(r"[,，;；。]", tail) and gap >= base * .25)
        return bool((prominent or emphasized) and size >= base * .9 or size >= base * .98 and
                    (isolated and line.get("_blockStart", True) and MAIN_HEADINGS.fullmatch(tail) or chinese_subheading))
    if known:
        return bool(prominent or emphasized or isolated and size >= base * .98)
    return bool(len(text) <= 80 and bold and (line.get("_blockStart", True) or isolated) or prominent and isolated)


def split_paragraphs(lines, document_id="", geometry=()):
    if not lines:
        return []
    gaps = []
    for prev, cur in zip(lines, lines[1:]):
        gap = cur["y0"] - prev["y1"]
        if 0 < gap < 200:
            gaps.append(gap)
    median = sorted(gaps)[len(gaps) // 2] if gaps else 4
    threshold = max(median * 1.6, 7)
    paragraphs = []
    current = []
    for line in lines:
        if current:
            prev = current[-1]
            gap = line["y0"] - prev["y1"]
            reset = line["y0"] < prev["y0"] - max(line["size"], prev["size"])
            across = abs(line["x0"] - prev["x0"]) > max(36, line["size"] * 3)
            different_column = across and min(line["x1"] - line["x0"], prev["x1"] - prev["x0"]) > 100
            if gap > threshold or line["page"] != prev["page"] or reset or different_column:
                paragraphs.append(current)
                current = []
        current.append(line)
    if current:
        paragraphs.append(current)
    out = []
    for group in paragraphs:
        text = norm(" ".join(item["text"] for item in group))
        if not text:
            continue
        entry = {"text": text, "page": group[0]["page"], "size": group[0]["size"]}
        if geometry:
            attach_anchor(entry, "paragraph", group, text, document_id, geometry)
        out.append(entry)
    return out


def caption_like(text):
    return bool(CAPTION.match(classification_text(text)))


def is_caption_start(line, base):
    text = classification_text(line["text"])
    match = CAPTION.match(text)
    if not match or line.get("_tableCell"):
        return False
    tail = text[match.end():].lstrip()
    if tail.startswith((",", "，", ";", "；")):
        return False
    tail = tail.lstrip(".:：、 ")
    if len(tail) < 6 or re.match(r"^(?:shows?|illustrates?|demonstrates?|presents?|depicts?|indicates?|is|are|was|were|compares?|provides?|can|has|have)\b", tail, re.IGNORECASE):
        return False
    size = line.get("dominantSize", line["size"])
    # Body references remain body references even when a PDF wraps 'Fig. 1' to
    # the beginning of a visual line.
    distinctive = size <= base * .94 or line.get("leadingBold", False)
    # Some publishers use the regular body face for captions. An explicit
    # label delimiter and an isolated block are stronger evidence than font
    # size alone; ordinary "Table 2 summarizes ..." remains a body mention.
    explicit_label = (match.group(1).lower() in ("figure", "fig", "fig.", "table") and
                      bool(re.match(r"^[.:：]\s*\S", text[match.end():])) and
                      base * .85 <= size <= base * 1.05 and
                      line.get("_gapBefore", 0) >= base * .9)
    return bool((distinctive or explicit_label) and line.get("_blockStart", True))


def merge_bilingual_captions(entries, pages, document_id, geometry, base):
    """Merge only adjacent Chinese/English caption variants of one asset."""
    by_id = {line["id"]: line for lines in pages for line in lines}
    def caption_lines(entry):
        return [by_id[line_id] for line_id in entry.get("_lineIds", []) if line_id in by_id]
    def bounds(entry):
        lines = caption_lines(entry)
        return [min(line["x0"] for line in lines), min(line["y0"] for line in lines),
                max(line["x1"] for line in lines), max(line["y1"] for line in lines)] if lines else None
    def language(entry):
        return "zh" if re.match(r"^[图表]", entry.get("label", "")) else "en" if re.match(r"^(?:fig|table)", entry.get("label", ""), re.IGNORECASE) else ""
    ordered = list(entries)
    used, merged = set(), []
    for entry in ordered:
        if entry["id"] in used:
            continue
        box = bounds(entry)
        partners = []
        for other in ordered:
            if other["id"] == entry["id"] or other["id"] in used or other["page"] != entry["page"] or other["number"] != entry["number"] or other["kind"] != entry["kind"]:
                continue
            if not language(entry) or {language(entry), language(other)} != {"zh", "en"}:
                continue
            second = bounds(other)
            if not box or not second:
                continue
            upper, lower = (box, second) if box[1] <= second[1] else (second, box)
            gap = lower[1] - upper[3]
            overlap = min(box[2], second[2]) - max(box[0], second[0])
            short_width = min(box[2] - box[0], second[2] - second[0])
            centers = abs((box[0] + box[2] - second[0] - second[2]) / 2)
            if not (-1 <= gap <= base * 1.6 and overlap >= short_width * .6 and centers <= base * 3):
                continue
            source_ids = set(entry.get("_lineIds", [])) | set(other.get("_lineIds", []))
            # Same page and number are insufficient: an intervening text line
            # in this horizontal footprint makes them separate objects.
            intervening = any(line["id"] not in source_ids and line["y0"] >= upper[3] - .5 and line["y1"] <= lower[1] + .5 and
                              line["x1"] > max(box[0], second[0]) and line["x0"] < min(box[2], second[2])
                              for line in pages[entry["page"]])
            if not intervening:
                partners.append((max(0, gap), other))
        partners.sort(key=lambda item: item[0])
        if not partners or len(partners) > 1 and partners[1][0] - partners[0][0] < base:
            merged.append(entry); used.add(entry["id"]); continue
        other = partners[0][1]
        pair = sorted([entry, other], key=lambda value: (bounds(value) or [0, 0, 0, 0])[1])
        lines = [line for variant in pair for line in caption_lines(variant)]
        raw = norm(" ".join(line["text"] for line in lines))
        result = {**pair[0], "caption": raw[:2400], "captionVariants": [
            {"language": language(variant), "label": variant["label"], "caption": variant["caption"], "anchor": variant["captionAnchor"]}
            for variant in pair], "bilingualMerged": True,
            "truncated": len(raw) > 2400 or any(variant.get("truncated") for variant in pair)}
        attach_anchor(result, "caption", lines, result["caption"], document_id, geometry)
        result["captionAnchor"] = result["anchor"]
        result["_lineIds"] = [line["id"] for line in lines]
        merged.append(result); used.update(variant["id"] for variant in pair)
    return merged


def collect_captions(pages, headings, document_id="", geometry=(), base=None):
    figures = []
    tables = []
    base = base or body_size(pages)
    for lines in pages:
        for index, line in enumerate(lines):
            if line["id"] in headings or not is_caption_start(line, base):
                continue
            match = CAPTION.match(classification_text(line["text"]))
            caption = [line]
            for follow in lines[index + 1 : index + 24]:
                previous = caption[-1]
                cross_block_tail = (line.get("dominantSize", line["size"]) <= base * .94 and
                                    follow.get("_column", 0) == line.get("_column", 0) and
                                    follow.get("font") == line.get("font") and
                                    -.5 <= follow["y0"] - previous["y1"] <= line["size"] * .6 and
                                    line["x0"] - 3 <= follow["x0"] and follow["x1"] <= line["x1"] + 3 and
                                    bool(re.match(r"^[a-z(]", follow["text"])) and not TERMINAL.search(previous["text"]))
                if (follow.get("blockId") != line.get("blockId") and not cross_block_tail) or follow.get("_tableCell") or follow["id"] in headings:
                    break
                if caption_like(follow["text"]) or abs(follow.get("dominantSize", follow["size"]) - line.get("dominantSize", line["size"])) > max(1, line["size"] * .16):
                    break
                previous = caption[-1]
                if follow["y0"] < previous["y0"] - line["size"] or follow["y0"] - previous["y1"] > max(8, line["size"] * .8):
                    break
                if abs(follow["x0"] - line["x0"]) > max(40, line["size"] * 4) and not cross_block_tail:
                    break
                caption.append(follow)
                if sum(len(item["text"]) for item in caption) >= 2400:
                    break
            raw = norm(" ".join(item["text"] for item in caption))
            kind = "table" if match.group(1).lower() in ("table", "表") else "figure"
            entry = {"label": match.group(0).strip(), "number": match.group(2).upper(), "kind": kind,
                     "caption": raw[:2400], "page": line["page"], "regionStatus": "caption-only",
                     "graphicRegion": None, "graphicRegionStatus": "unavailable", "mentions": [], "truncated": len(raw) > 2400}
            if geometry:
                attach_anchor(entry, "caption", caption, entry["caption"], document_id, geometry)
                entry["captionAnchor"] = entry["anchor"]
            entry["_lineIds"] = [item["id"] for item in caption]
            if kind == "table":
                tables.append(entry)
            else:
                figures.append(entry)
    return merge_bilingual_captions(figures, pages, document_id, geometry, base), merge_bilingual_captions(tables, pages, document_id, geometry, base)


def attach_table_content(pages, tables, document_id, geometry, base):
    """Keep confirmed ruled cells with their floating table, never body prose.

    This is line-level text only. No column order or graphic rectangle is
    inferred, and unassigned table-like fragments stay in the existing flow.
    """
    assigned = {entry["id"]: [] for entry in tables}
    for lines in pages:
        for line in lines:
            if not line.get("_tableCell"):
                continue
            options = []
            for entry in tables:
                if entry.get("page") != line["page"]:
                    continue
                segments = (entry.get("captionAnchor") or entry.get("anchor") or {}).get("segments", [])
                boxes = [segment["bbox"] for segment in segments if segment.get("page") == line["page"]]
                if not boxes:
                    continue
                left, top = min(box[0] for box in boxes), min(box[1] for box in boxes)
                right, bottom = max(box[2] for box in boxes), max(box[3] for box in boxes)
                # Table captions above a ruled grid are unambiguous here. A
                # caption below a grid is deliberately not guessed.
                distance = line["y0"] - bottom
                center = (line["x0"] + line["x1"]) / 2
                if -2 <= distance <= base * 40 and left - base * 4 <= center <= right + base * 4:
                    options.append((max(0, distance), entry))
            options.sort(key=lambda item: item[0])
            if options and (len(options) == 1 or options[1][0] - options[0][0] >= base):
                assigned[options[0][1]["id"]].append(line)
    moved = set()
    for entry in tables:
        lines = assigned[entry["id"]]
        if len(lines) < 3:
            continue
        # Long model names and row labels can fail the narrow cell classifier.
        # Preserve all text fragments wholly inside this already-confirmed
        # ruled-cell envelope, rather than concatenating disjoint cells and
        # silently dropping the intervening source words.
        left, top = min(line["x0"] for line in lines), min(line["y0"] for line in lines)
        right, bottom = max(line["x1"] for line in lines), max(line["y1"] for line in lines)
        page_lines = pages[entry["page"]]
        confirmed_blocks = {}
        for line in lines:
            block = line.get("blockId")
            if block:
                confirmed_blocks[block] = confirmed_blocks.get(block, 0) + 1
        # A long label may protrude beyond the shorter ruled-cell envelope.
        # Extend only within a strongly cell-dominated original PDF block;
        # do not recruit nearby prose merely because it is on the same page.
        dense_blocks = {block for block, count in confirmed_blocks.items()
                        if count >= 3 and count / max(1, sum(line.get("blockId") == block for line in page_lines)) >= .6}
        lines = [line for line in page_lines if line["y0"] >= top - 3 and line["y1"] <= bottom + 3 and (
                 line["x0"] >= left - 3 and line["x1"] <= right + 3 or
                 line.get("blockId") in dense_blocks and line["x0"] >= left - base * 4 and line["x1"] <= right + base * 4)]
        raw = norm(" ".join(line["text"] for line in lines))
        content = {"text": raw[:12000], "sourceKind": "table-content-linearized",
                   "layout": "pdf-text-order", "columnsVerified": False,
                   "regionStatus": "text-line-fragments", "truncated": len(raw) > 12000}
        attach_anchor(content, "table-content", lines, content["text"], document_id, geometry)
        entry["content"] = content
        moved.update(line["id"] for line in lines)
    return moved


def attach_asset_sections(figures, tables, sections):
    """Associate floating assets by verified body mention, not physical order."""
    for entry in [*figures, *tables]:
        section_ids = []
        for mention in entry.get("mentions", []):
            if mention.get("matchStatus") != "matched":
                continue
            key = source_key(mention.get("text", ""))
            owners = [section for section in sections if key and any(
                paragraph.get("page") == mention.get("page") and key in source_key(paragraph.get("text", ""))
                for paragraph in section.get("paragraphs", []))]
            if not owners:
                # Interleaved superscript citation blocks can make a literal
                # sentence differ from paragraph text order. Require all of
                # its verified source line IDs to belong to one body section;
                # proximity to a figure caption is never ownership evidence.
                anchor = mention.get("anchor") or {}
                line_ids = {line_id for segment in anchor.get("segments", []) for line_id in segment.get("lineIds", [])}
                if anchor.get("status") == "located" and anchor.get("quoteVerified") and line_ids:
                    owners = [section for section in sections if
                              (section.get("anchor") or {}).get("documentId") == anchor.get("documentId") and
                              line_ids <= {line_id for paragraph in section.get("paragraphs", [])
                                           for segment in (paragraph.get("anchor") or {}).get("segments", [])
                                           for line_id in segment.get("lineIds", [])}]
            mention["sectionIds"] = [section["id"] for section in owners]
            if len(owners) == 1:
                mention.update({"sectionId": owners[0]["id"], "sectionTitle": owners[0]["heading"]})
                if owners[0]["id"] not in section_ids:
                    section_ids.append(owners[0]["id"])
        entry["mentionedSectionIds"] = section_ids
        entry["sectionAssociation"] = "body-mentions" if section_ids else "unresolved"


MENTION = re.compile(r"(?<![A-Za-z])(?P<kind>fig(?:ure)?s?\.?|tables?|图|表)\s*(?P<numbers>(?:[A-Z]?\d+[a-z]?|[IVX]+)(?:\s*(?:[,，、]|and|&|to|[-–—])\s*(?:[A-Z]?\d+[a-z]?|[IVX]+))*)(?![A-Za-z0-9])", re.IGNORECASE)


def mentioned_labels(text):
    labels = set()
    for match in MENTION.finditer(classification_text(text)):
        kind = "table" if match.group("kind").lower().startswith("table") or match.group("kind") == "表" else "figure"
        value = match.group("numbers")
        expanded = []
        for piece in re.split(r"\s*(?:[,，、]|\band\b|&|\bto\b)\s*", value, flags=re.IGNORECASE):
            span = re.fullmatch(r"(\d+)\s*[-–—]\s*(\d+)", piece)
            if span and 0 <= int(span.group(2)) - int(span.group(1)) <= 20:
                expanded.extend(str(number) for number in range(int(span.group(1)), int(span.group(2)) + 1))
            else:
                expanded.extend(re.findall(r"[A-Z]?\d+[a-z]?|[IVX]+", piece, re.IGNORECASE))
        labels.update((kind, number.upper()) for number in expanded)
    return labels


def sentence_ranges(text):
    start = 0
    for match in re.finditer(r"[.。!?！？]", text):
        index = match.start()
        if match.group() == ".":
            before = text[max(0, index - 16):index]
            after = text[index + 1:index + 2]
            if index and text[index - 1].isdigit() and after.isdigit():
                continue
            if re.search(r"(?:\b(?:figs?|eqs?|refs?|et al|e\.g|i\.e|vs|no|vol|pp)|\b[A-Z])$", before, re.IGNORECASE):
                continue
        if match.group() in ".!?" and index + 1 < len(text) and not text[index + 1].isspace():
            continue
        end = index + 1
        if text[start:end].strip():
            yield start, end
        start = end
    if text[start:].strip():
        yield start, len(text)


def attach_mentions(pages, figures, tables, excluded_ids, document_id, geometry):
    entries = [*figures, *tables]
    by_label = {}
    for entry in entries:
        by_label.setdefault((entry["kind"], entry["number"]), []).append(entry)
    groups = {}
    for lines in pages:
        for line in lines:
            if line["id"] in excluded_ids or line.get("_tableCell"):
                continue
            groups.setdefault((line["page"], line.get("blockId"), line.get("_column", 0)), []).append(line)
    stream = []
    base = body_size(pages)
    for group in groups.values():
        group.sort(key=lambda line: (line["y0"], line["x0"]))
        value = norm(" ".join(line["text"] for line in group))
        cjk_line = len(re.findall(r"[\u4e00-\u9fff]", value)) >= 4
        if (len(value) < 25 and not cjk_line) or max(line.get("dominantSize", line["size"]) for line in group) < base * .85:
            continue
        stream.append(group)
    stream.sort(key=lambda group: (group[0]["page"], group[0].get("_column", 0), group[0]["y0"]))
    merged = []
    for group in stream:
        if merged:
            previous = merged[-1]
            before = previous[-1]["text"].rstrip()
            after = group[0]["text"].lstrip()
            # CJK publishers may emit each body line as its own PDF block.
            # Rejoin only adjacent same-page/column lines with matching body
            # face and overlapping horizontal footprints; never bridge a
            # caption/table/heading gap or infer text on another page.
            last, first = previous[-1], group[0]
            cjk_adjacent = (bool(re.search(r"[\u4e00-\u9fff]", before)) and
                            bool(re.search(r"[\u4e00-\u9fff]", after)) and
                            first["page"] == last["page"] and first.get("_column", 0) == last.get("_column", 0) and
                            bool(first.get("font")) and first.get("font") == last.get("font") and
                            .9 <= first["size"] / max(last["size"], .01) <= 1.1 and
                            -1 <= first["y0"] - last["y1"] <= base * .9 and
                            first["x0"] <= last["x0"] + base * .5 and
                            min(first["x1"], last["x1"]) - max(first["x0"], last["x0"]) >=
                            min(first["x1"] - first["x0"], last["x1"] - last["x0"]) * .75)
            latin_tail = after[:1].islower() and group[0]["page"] - previous[-1]["page"] <= 2
            if before and after and not re.search(r"[.。!?！？]$", before) and (latin_tail or cjk_adjacent):
                previous.extend(group)
                continue
        merged.append(group)
    seen = set()
    for group in merged:
        text = ""
        offsets = []
        for line in group:
            value = norm(line["text"])
            if text:
                text += " "
            offsets.append((len(text), len(text) + len(value), line))
            text += value
        for start, end in sentence_ranges(text):
            quote = text[start:end].strip()
            labels = mentioned_labels(quote)
            if not labels:
                continue
            source_lines = [line for lo, hi, line in offsets if lo < end and hi > start]
            if not source_lines:
                continue
            for label in labels:
                candidates = by_label.get(label, [])
                for entry in candidates:
                    identity = (entry["id"], quote, tuple(line["id"] for line in source_lines))
                    if identity in seen:
                        continue
                    seen.add(identity)
                    mention = {"text": quote[:1400], "page": source_lines[0]["page"],
                               "matchStatus": "matched" if len(candidates) == 1 else "ambiguous",
                               "candidateCaptionIds": [candidate["id"] for candidate in candidates], "truncated": len(quote) > 1400,
                               "sentenceStatus": "complete" if re.search(r"[.。!?！？]$", quote) else "partial-source-sentence"}
                    attach_anchor(mention, "figure-mention" if label[0] == "figure" else "table-mention", source_lines, mention["text"], document_id, geometry)
                    entry["mentions"].append(mention)
    for entry in entries:
        entry["mentions"].sort(key=lambda mention: (mention["page"], (mention["bbox"] or [0, 0])[1]))
        entry.pop("_lineIds", None)


def reference_publication_continuation(text):
    """Reject a bare venue/year/volume tail as independent corporate authors.

    Capitalization plus '. YYYY.' is not enough when the entire remainder is
    only a publication locator. This does not reject substantive titles or
    numbered references, and does not rewrite the original bibliography text.
    """
    return bool(re.fullmatch(
        r"[A-Z][A-Za-z& \-]{1,60}\.\s+\(?(?:19|20)\d{2}[a-z]?\)?[.,]?\s+"
        r"(?:(?:[Vv]ol(?:ume)?\.?|[Ii]ssue|[Nn]o\.?)\s*\d{1,4}"
        r"(?:\s*[,;:]\s*(?:[Pp]ages?|pp?\.)?\s*\d+(?:[–\-]\d+)?)?"
        r"|(?:[Pp]ages?|pp?\.)\s*\d+(?:[–\-]\d+)?)[.,;]?", text.strip()))


def reference_author_start(text):
    if reference_publication_continuation(text):
        return False
    return bool(re.match(
        r"^(?:[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ž'’\-]+(?:,|\s+[A-Z](?:\.|\b))|"
        r"[A-Z][A-Za-z0-9& .\-]{1,60}:\s*|"
        r"[A-Z][A-Za-z& .\-]{1,60}\.\s+\(?\d{4}|"
        r"[\u4e00-\u9fff]{2,8}[，,])", text))


def reference_parenthesized_author_start(text):
    """A dated personal or multiword organization entry in a bibliography."""
    normalized = unicodedata.normalize("NFKC", text)
    dated = re.match(r"^(.{3,250}?)\s*\((?:19|20)\d{2}[a-z]?(?:,\s+[A-Z][a-z]+)?\)\.\s+\S", normalized)
    if not dated:
        return False
    author = dated.group(1)
    person = r"(?:(?:de|del|da|di|du|van|von|la|le)\s+){0,2}[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ž'’\-]+,\s*[A-Z]\."
    organization = r"(?:[A-Z][A-Za-z&\-]+\s+){1,5}[A-Z][A-Za-z&\-]+"
    return bool(re.match(person, author) or re.fullmatch(organization, author))


def reference_number(text):
    # Normalize only the classification copy. Raw/quote/geometry stay intact.
    match = REFERENCE_START.match(unicodedata.normalize("NFKC", text))
    return match if match and int(match.group(1) or match.group(2)) < 1000 else None


def reference_alpha_label(text):
    return re.match(r"^\[([A-Za-z]{1,8}\d{1,4}[a-z]?)\]\s+\S", text)


def reference_full_author_year_start(line, following=None):
    """Extra evidence for full-name author-year entries, only inside bibliography.

    A title/venue starting with capitalized words is insufficient: require a
    personal-name list (comma or 'and') followed by the author's '. YYYY.' slot.
    Look at one genuine continuation line at most; never borrow another entry's
    year from a separated block. This classification does not change raw lines.
    """
    name = r"[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ž'’\-]+"
    author_list = re.compile(r"^" + name + r"(?:\s+" + name + r"){1,3}(?:,\s+|\s+and\s+)" + name)
    if not author_list.match(line["text"]):
        return False
    probe = line["text"]
    if (following and following["page"] == line["page"]
            and following.get("_referenceColumn") == line.get("_referenceColumn")
            and following.get("blockId") == line.get("blockId")):
        probe += " " + following["text"]
    year = re.search(r"\.\s+(?:19|20)\d{2}[a-z]?\.(?:\s|$)", probe)
    return bool(year and year.start() <= 400)


def reference_page_footer_ids(pages, geometry):
    """Find only source-geometric page numbers, never trim a reference string.

    A standalone decimal must repeat a separate bottom slot and either match
    its physical PDF page number or follow a verified one-page-cover offset.
    The offset requires a centered slot matching printed pages 1–3. An
    article-number prefix requires at least three pages with the same prefix,
    font and slot. Its suffix must equal the physical page. Uncertain scientific
    numeric lines remain.
    This is used only for bibliography collection; PDF/body lines stay intact.
    """
    candidates = []
    for pno, lines in enumerate(pages):
        if pno >= len(geometry):
            continue
        g = geometry[pno]
        try:
            width, height = float(g["width"]), float(g["height"])
        except (KeyError, TypeError, ValueError):
            continue
        if not (math.isfinite(width) and math.isfinite(height) and width > 0 and height > 0):
            continue
        for line in lines:
            text = str(line.get("text", "")).strip()
            decimal = re.fullmatch(r"[1-9][0-9]{0,3}", text)
            article = re.fullmatch(r"([0-9]{5,10})-([1-9][0-9]{0,3})", text)
            if decimal and int(text) == pno + 1:
                kind, series, peers_required = "decimal", "", 1
            elif decimal and int(text) == pno:
                kind, series, peers_required = "cover-decimal", "", 2
            elif article and int(article.group(2)) == pno + 1:
                kind, series, peers_required = "article", article.group(1), 2
            else:
                continue
            if line.get("page") != pno or not line.get("id") or not line.get("blockId") or line.get("_boxedGraphicText") or line.get("_tableCell"):
                continue
            box = line.get("bbox")
            if not isinstance(box, (list, tuple)) or len(box) != 4:
                continue
            try:
                x0, y0, x1, y1 = map(float, box)
                size = float(line["size"])
            except (KeyError, TypeError, ValueError):
                continue
            if not all(math.isfinite(value) for value in (x0, y0, x1, y1, size)):
                continue
            if not (size > 0 and 0 <= x0 < x1 <= width and height * .90 <= y0 < y1 <= height):
                continue
            if kind == "cover-decimal" and abs((x0 + x1) / (2 * width) - .5) > .05:
                continue
            if x1 - x0 > min(width * .10, size * (len(text) + 1)) or y1 - y0 > size * 1.8:
                continue
            others = [item for item in lines if item.get("id") != line["id"]]
            if any(item.get("blockId") == line["blockId"] for item in others):
                continue
            # A true citation page/volume number normally shares a block or
            # line flow; a footer has a clear empty gap and is the last text.
            try:
                bottoms = [float(item["bbox"][3]) for item in others]
            except (KeyError, TypeError, ValueError, IndexError):
                continue
            if not bottoms or not all(math.isfinite(value) for value in bottoms):
                continue
            gap = max(6, size * .75) if kind == "article" else max(12, size * 1.2)
            if max(bottoms) > y0 + .3 or y0 - max(bottoms) < gap:
                continue
            candidates.append({"id": line["id"], "page": pno, "x": (x0 + x1) / (2 * width),
                               "y": y0 / height, "size": size, "font": line.get("font", ""),
                               "kind": kind, "series": series, "peersRequired": peers_required})
    def peer(a, b):
        return (a["page"] != b["page"] and a["kind"] == b["kind"] and a["series"] == b["series"] and
                abs(a["y"] - b["y"]) <= .012 and
                (abs(a["x"] - b["x"]) <= .035 or abs(a["x"] + b["x"] - 1) <= .035) and
                .85 <= a["size"] / b["size"] <= 1.18 and bool(a["font"]) and a["font"] == b["font"])
    verified = set()
    for item in candidates:
        pages = {other["page"] for other in candidates if peer(item, other)}
        if len(pages) < item["peersRequired"]:
            continue
        if item["kind"] == "cover-decimal" and not {1, 2, 3}.issubset(pages | {item["page"]}):
            continue
        verified.add(item["id"])
    return verified


def reference_publication_note_ids(reference_lines, pages, geometry, footer_ids):
    """Exclude only an isolated final numbered-bibliography editorial note.

    A label inside a title, an uncertain author-year boundary, a multi-line
    block, or a note with scientific text below is retained. Source lines are
    never changed. The final bibliography page may precede an English abstract.
    """
    pattern = re.compile(r"^[（(]\s*责任编辑\s*[：:]\s*[\u4e00-\u9fff·]{2,8}\s*[）)]$")
    numbered_pages = {}
    last_source_pages = {}
    for line in reference_lines:
        region = line.get("_referenceRegion", 0)
        if reference_number(line["text"]):
            numbered_pages[region] = max(numbered_pages.get(region, -1), line["page"])
        if not pattern.fullmatch(line["text"].strip()):
            last_source_pages[region] = max(last_source_pages.get(region, -1), line["page"])
    found = set()
    for line in reference_lines:
        pno, region = line["page"], line.get("_referenceRegion", 0)
        if not pattern.fullmatch(line["text"].strip()) or numbered_pages.get(region) != pno or last_source_pages.get(region) != pno:
            continue
        if not (0 <= pno < len(pages) and pno < len(geometry)) or not line.get("id") or not line.get("blockId"):
            continue
        if line.get("_boxedGraphicText") or line.get("_tableCell"):
            continue
        try:
            width, height = float(geometry[pno]["width"]), float(geometry[pno]["height"])
            x0, y0, x1, y1 = map(float, line["bbox"])
            size = float(line["size"])
        except (KeyError, TypeError, ValueError):
            continue
        if not all(math.isfinite(v) for v in (width, height, x0, y0, x1, y1, size)):
            continue
        if not (width > 0 and height > 0 and size > 0 and 0 <= x0 < x1 <= width and height * .82 <= y0 < y1 <= height * .95):
            continue
        if x1 - x0 > min(width * .4, size * (len(line["text"]) + 1)) or y1 - y0 > size * 1.8:
            continue
        others = [item for item in pages[pno] if item.get("id") != line["id"]]
        if any(item.get("blockId") == line["blockId"] for item in others):
            continue
        scientific = [item for item in others if item.get("id") not in footer_ids]
        try:
            bottoms = [float(item["bbox"][3]) for item in scientific]
        except (KeyError, TypeError, ValueError, IndexError):
            continue
        if not bottoms or not all(math.isfinite(v) for v in bottoms):
            continue
        if max(bottoms) > y0 + .3 or y0 - max(bottoms) < max(10, size * .85):
            continue
        # It must be geometrically below genuine reference source on that page.
        preceding = [item for item in reference_lines if item.get("id") != line["id"] and
                     item["page"] == pno and item.get("_referenceRegion", 0) == region]
        if not any(item.get("bbox") and item["bbox"][3] < y0 for item in preceding):
            continue
        found.add(line["id"])
    return found


def collect_reference_lines(pages, base, margin, heading_ids=(), geometry=()):
    out = []
    active = False
    region = 0
    footer_ids = reference_page_footer_ids(pages, geometry)
    for lines in pages:
        for line in lines:
            if line.get("id") in footer_ids:
                continue
            if REFERENCE_HEADING.match(line_heading_text(line)):
                if not active:
                    region += 1
                active = True
                continue
            if not active:
                continue
            # Stop at the next real section; do not absorb an appendix into the
            # last reference merely because it follows the bibliography.
            explicit_end = re.match(r"^(?:author contributions?|competing interests?|data availability|code availability|declarations|funding|ethics|supplementary information|acknowledg(?:e)?ments?|作者贡献|利益冲突|数据可用性|代码可用性|基金资助)\b", line["text"], re.IGNORECASE)
            appendix_heading = line["id"] in heading_ids and re.match(
                r"^(?:appendix(?:\s+[A-Z0-9]+)?|附录(?:\s*[A-Z0-9]+)?)(?:\s*[:.：]|\s*$)",
                line_heading_text(line), re.IGNORECASE)
            if appendix_heading and out:
                prefix = out[-1]
                same_title_line = (prefix["page"] == line["page"] and prefix.get("blockId") == line.get("blockId")
                                   and abs(prefix["y0"] - line["y0"]) < max(3, line["size"] * .3))
                if same_title_line and re.fullmatch(r"[A-Z](?:\.\d+)?[.)]?", prefix["text"]):
                    out.pop()
            access_date = re.fullmatch(r"\d{1,4}\s*\((?:19|20)\d{2}\)[.,;]?", line["text"])
            if explicit_end or appendix_heading or ((line["id"] in heading_ids or is_heading(line, base, margin)) and not access_date and not reference_number(line["text"])
                                and not reference_author_start(line["text"])):
                active = False
                continue
            out.append({**line, "_referenceRegion": region})
    note_ids = reference_publication_note_ids(out, pages, geometry, footer_ids)
    return [line for line in out if line.get("id") not in note_ids]


UNHEADED_REFERENCE_NUMBER = re.compile(r"^\[(\d{1,3})\]\s+(.+)$")
UNHEADED_REFERENCE_PRECEDING_HEADING = re.compile(
    r"^(?:(?:[IVXLCDM]+|\d+)\.?\s+)?"
    r"(?:conclusions?|concluding remarks|outlook|acknowledg(?:e)?ments?|结论|总结|致谢)\s*[.:：]?$",
    re.I,
)
UNHEADED_REFERENCE_PUBLICATION = re.compile(
    r"(?:\b(?:18|19|20)\d{2}\b|https?://|\barxiv:|\bdoi:|\bunpublished\b)",
    re.I,
)
UNHEADED_REFERENCE_INITIALS = re.compile(r"^(?:[A-ZÀ-ÖØ-Þ]\.\s*){1,5}[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ž’'\-]+")


def unheaded_reference_number(line):
    match = UNHEADED_REFERENCE_NUMBER.match(unicodedata.normalize("NFKC", line["text"]))
    if not match or line.get("_boxedGraphicText"):
        return None
    return int(match[1])


def unheaded_reference_column(line, geometry):
    return int(line["x0"] >= geometry[line["page"]]["width"] * .49)


def unheaded_reference_continuation(line, group, geometry):
    first, prev = group[0], group[-1]
    if line["page"] != prev["page"] or unheaded_reference_column(line, geometry) != unheaded_reference_column(prev, geometry):
        return False
    width = geometry[line["page"]]["width"]
    size = first["size"]
    return (
        line["x1"] - line["x0"] < width * .72
        and line["x0"] >= first["x0"] - size * .25
        and -.4 <= line["y0"] - prev["y1"] <= max(5, size * .75)
        and .88 * size <= line["size"] <= 1.12 * size
        and (not line.get("_tableCell") or line.get("blockId") == first.get("blockId"))
        and not line.get("_boxedGraphicText")
    )


def unheaded_reference_groups(lines, start, geometry):
    numbered = [line for line in lines[start:] if unheaded_reference_number(line) is not None]
    ordered = {}
    for line in lines:
        ordered.setdefault((line["page"], unheaded_reference_column(line, geometry)), []).append(line)
    for group in ordered.values():
        group.sort(key=lambda line: (line["y0"], line["x0"]))
    groups = []
    for index, first in enumerate(numbered):
        if unheaded_reference_number(first) != index + 1:
            break
        slot = (first["page"], unheaded_reference_column(first, geometry))
        following = numbered[index + 1] if index + 1 < len(numbered) else None
        if groups and (first["page"] - groups[-1][0]["page"] > 1
                       or (first["page"], unheaded_reference_column(first, geometry)) == (groups[-1][0]["page"], unheaded_reference_column(groups[-1][0], geometry))
                       and first["y0"] - groups[-1][-1]["y1"] > first["size"] * 2):
            return []
        cutoff = following["y0"] - following["size"] * .22 if following and (following["page"], unheaded_reference_column(following, geometry)) == slot else float("inf")
        group = [first]
        # Text fragments in one justified row can be labelled as table cells
        # by the page-layout pass. Only stitch physical pieces from the same
        # original block and baseline, keeping their original line IDs.
        row = [
            line for line in ordered[slot]
            if line["id"] != first["id"] and line.get("blockId") == first.get("blockId")
            and abs((line["y0"] + line["y1"] - first["y0"] - first["y1"]) / 2) <= first["size"] * .22
            and line["x0"] >= first["x1"] - .4 and unheaded_reference_number(line) is None
        ]
        group.extend(sorted(row, key=lambda line: line["x0"]))
        for line in ordered[slot]:
            if line["y0"] <= first["y0"] + first["size"] * .22 or line["y0"] >= cutoff:
                continue
            if unheaded_reference_number(line) is not None or len(group) >= 16 or not unheaded_reference_continuation(line, group, geometry):
                break
            group.append(line)
        groups.append(group)
    return groups


def unheaded_reference_has_bibliography_signals(group):
    content = UNHEADED_REFERENCE_NUMBER.match(unicodedata.normalize("NFKC", group[0]["text"]))[2]
    if not UNHEADED_REFERENCE_INITIALS.match(content) and not reference_author_start(content):
        return False
    return bool(UNHEADED_REFERENCE_PUBLICATION.search(" ".join(line["text"] for line in group)))


def infer_unheaded_reference_groups(pages, geometry):
    footer_ids = reference_page_footer_ids(pages, geometry)
    lines = [line for page in pages for line in page if line["id"] not in footer_ids]
    closing_positions = [i for i, line in enumerate(lines) if UNHEADED_REFERENCE_PRECEDING_HEADING.fullmatch(line_heading_text(line))]
    if not closing_positions:
        return []
    candidates = []
    for i, line in enumerate(lines):
        if i <= closing_positions[-1] or unheaded_reference_number(line) != 1 or line.get("_tableCell"):
            continue
        groups = unheaded_reference_groups(lines, i, geometry)
        if len(groups) < 8:
            continue
        if not all(unheaded_reference_has_bibliography_signals(group) for group in groups[:4]):
            continue
        if sum(unheaded_reference_has_bibliography_signals(group) for group in groups) / len(groups) < .8:
            continue
        candidates.append(groups)
    return candidates[0] if len(candidates) == 1 else []


def parse_references(lines, document_id="", geometry=()):
    if not lines:
        return []
    lefts = {}
    for line in lines:
        width = geometry[line["page"]]["width"] if geometry else max(item["x1"] for item in lines if item["page"] == line["page"])
        column = int(line["x0"] >= width * .48)
        line["_referenceColumn"] = column
        key = (line["page"], column)
        lefts[key] = min(lefts.get(key, float("inf")), line["x0"])
    alpha_labels = {}
    for line in lines:
        match = reference_alpha_label(line["text"])
        if match:
            alpha_labels.setdefault(line.get("_referenceRegion", 0), set()).add(match.group(1))
    alpha_regions = {region for region, labels in alpha_labels.items() if len(labels) >= 2}
    numbered_regions = {line.get("_referenceRegion", 0) for line in lines if reference_number(line["text"])}
    entries = []
    current = []
    for index, line in enumerate(lines):
        text = line["text"]
        region = line.get("_referenceRegion", 0)
        numbered = region in numbered_regions
        starts = bool(reference_number(text)) and not line.get("_inferredReferenceContinuation")
        if starts and current:
            previous = current[-1]
            # Keep a split printed page range and its DOI in the same entry.
            if (previous["page"] == line["page"] and previous.get("blockId") == line.get("blockId")
                    and abs(previous["x0"] - line["x0"]) <= 1.5
                    and re.search(r"\d\s*[-–—−]\s*$", previous["text"])
                    and re.match(r"^\d{1,4}\.\s*(?:https?://(?:dx\.)?doi\.org/|PMID\b|doi\s*:)", text, re.IGNORECASE)):
                starts = False
        if region in alpha_regions:
            starts = bool(reference_alpha_label(text) or re.match(r"^\[\d{1,3}\]\s+\S", text))
            if re.match(r"^E-?mail address\s*:", text, re.IGNORECASE):
                if current and re.match(r"^(?:Department|Faculty|Institute|School)\s+of\b", current[-1]["text"], re.IGNORECASE):
                    current.pop()
                if current:
                    entries.append(current)
                    current = []
                continue
        elif not numbered:
            left = lefts[(line["page"], line["_referenceColumn"])]
            flush = line["x0"] <= left + max(2.2, line["size"] * .28)
            previous = current[-1] if current else None
            indent_return = previous and previous["x0"] > left + max(3, line["size"] * .4)
            block_break = previous and previous.get("blockId") != line.get("blockId")
            gap_break = previous and line["y0"] - previous["y1"] >= max(4, line["size"] * .35)
            year_end = previous and re.search(r"(?:19|20)\d{2}[a-z]?\)?[.,;]?\s*$", previous["text"], re.IGNORECASE)
            author_start = reference_author_start(text)
            # Full given names are common in author-year bibliographies. Only
            # use their lexical prefix with a true hanging-indent return and
            # a completed preceding entry / paragraph boundary.
            full_name = bool(re.match(r"^[A-ZÀ-ÖØ-Þ][A-Za-zÀ-ž'’\- ]{2,60}[,.]", text))
            geometric_author = full_name and (indent_return and (year_end or block_break or gap_break) or
                                              year_end and block_break and gap_break) and not caption_like(text)
            following = lines[index + 1] if index + 1 < len(lines) else None
            full_author_year = reference_full_author_year_start(line, following)
            same_flow = previous and previous["page"] == line["page"] and previous.get("_referenceColumn") == line.get("_referenceColumn")
            # A one-line preceding entry has no hanging-indent return. In a
            # confirmed reference region, its next independent author/year
            # paragraph still has a real block boundary and a substantial gap.
            paragraph_author = (full_author_year and block_break and same_flow
                                and line["y0"] - previous["y1"] >= max(6, line["size"] * .7))
            hanging_follow = (following and following["page"] == line["page"]
                              and following.get("_referenceColumn") == line.get("_referenceColumn")
                              and following["x0"] > left + max(3, line["size"] * .4))
            # Never compare y across pages/columns or split every page boundary.
            # The observed cross-page case follows a completed year-ending
            # entry and starts a new full author/year paragraph with hanging text.
            flow_author = full_author_year and previous and not same_flow and block_break and year_end and hanging_follow
            geometric_author = geometric_author or paragraph_author or flow_author
            dated_author = block_break and (indent_return or gap_break) and reference_parenthesized_author_start(text)
            starts = (flush and not reference_publication_continuation(text) and (author_start or geometric_author or dated_author)
                      and (not previous or indent_return or block_break or gap_break or year_end))
        if current and current[-1].get("_referenceRegion", 0) != region:
            entries.append(current)
            current = []
        if starts and current:
            entries.append(current)
            current = []
        if starts or current or not (numbered or region in alpha_regions):
            current.append(line)
    if current:
        entries.append(current)
    out = []
    for group in entries:
        raw = norm(" ".join(line["text"] for line in group))
        if len(raw) < 20:
            continue
        years = re.findall(r"\b(?:19|20)\d{2}[a-z]?\b", raw, re.IGNORECASE)
        parenthesized = re.findall(r"\(((?:19|20)\d{2}[a-z]?)\)", raw, re.IGNORECASE)
        doi = re.search(r"10\.\d{4,9}/[^\s\"<>]+", raw)
        number = reference_number(raw)
        alpha_label = reference_alpha_label(raw)
        entry = {
            "raw": raw[:4000], "page": group[0]["page"],
            "year": (parenthesized[0] if parenthesized else years[0] if years else ""),
            "years": list(dict.fromkeys(years)),
            "yearSource": "parenthesized-token" if parenthesized else "first-year-token" if years else "unavailable",
            "doi": doi.group(0).rstrip(".,;") if doi else "",
            "number": int(number.group(1) or number.group(2)) if number else None,
            "label": number.group(0).strip() if number else "[" + alpha_label.group(1) + "]" if alpha_label else "",
            "segmentation": "numbered" if number else "alphanumeric" if alpha_label else "author-year-heuristic",
            "segmentationConfidence": "high" if number or alpha_label else "low" if len(raw) > 1200 else "medium",
            "truncated": len(raw) > 4000, "rawLength": len(raw),
        }
        if geometry:
            attach_anchor(entry, "reference", group, entry["raw"], document_id, geometry)
        out.append(entry)
    return out


def printed_metadata_title(lines, base, metadata_title):
    """Use metadata only as a locator for matching title typography on page 1."""
    def key(text):
        return re.sub(r"\s+", "", unicodedata.normalize("NFKC", text)).casefold()

    metadata_title = norm(str(metadata_title or ""))
    if not 12 <= len(metadata_title) <= 300 or re.search(r"://|\.pdf$|^Microsoft Word\b", metadata_title, re.I):
        return None
    target = key(metadata_title)
    eligible = sorted(
        (line for line in lines if .04 <= line["relativeY"] < .4
         and line.get("dominantSize", line["size"]) >= base * 1.14),
        key=lambda line: (line["y0"], line["x0"]),
    )
    for index, first in enumerate(eligible):
        parts = []
        previous = None
        for follow in eligible[index:index + 4]:
            if previous is not None:
                size = first.get("dominantSize", first["size"])
                gap = follow["y0"] - previous["y1"]
                if (follow["y0"] <= previous["y0"] + 2 or gap < -size * .5 or gap > size
                        or abs(follow.get("dominantSize", follow["size"]) - size) > .75
                        or min(follow["x1"], previous["x1"]) - max(follow["x0"], previous["x0"]) <= 0):
                    break
            parts.append(follow["text"])
            previous = follow
            printed = norm(" ".join(parts))
            compared = key(printed)
            if compared == target:
                return printed, first["y0"]
            if not target.startswith(compared):
                break
    return None


def detect_title(pages, base, first_page=(), metadata_title=""):
    if not pages:
        return ""
    first = pages[0]
    candidates = [line for line in first if line["size"] >= base * 1.35 and line["relativeY"] < 0.6]
    printed = printed_metadata_title(first_page, base, metadata_title)
    if not candidates:
        return printed[0] if printed else ""
    candidates.sort(key=lambda line: line["y0"])
    top = candidates[0]
    if printed and top["y0"] < printed[1] and any(
        line["y0"] < printed[1]
        and re.match(r"^(?:contents lists available at\b|journal homepage\s*:)", line["text"], re.I)
        for line in first_page
    ):
        return printed[0]
    parts = [top["text"]]
    for line in candidates[1:]:
        if abs(line["size"] - top["size"]) < 0.6 and 0 < line["y0"] - top["y0"] < top["size"] * 4:
            # A separately spaced Latin translation is not a wrapped Chinese title line.
            if (len(re.findall(r"[\u4e00-\u9fff]", top["text"])) >= 4
                    and not re.search(r"[\u4e00-\u9fff]", line["text"])
                    and len(re.findall(r"[A-Za-z]", line["text"])) >= 8
                    and line["y0"] - top["y1"] > top["size"]):
                break
            parts.append(line["text"])
        if len(parts) >= 3:
            break
    return norm(" ".join(parts))[:300]


def extract_document(pdf_path):
    document_id = document_fingerprint(pdf_path)
    doc = fitz.open(pdf_path)
    geometry = page_geometry(doc)
    raw_pages = collect_lines(doc)
    pages = drop_running_headers(compose_short_chinese_headings(raw_pages))
    base = body_size(pages)
    pages = prepare_layout(pages, base, geometry)
    pages = reading_order(pages, geometry)
    pages = prepare_heading_numbering(pages, base)
    margin = left_margin(pages, base)
    title = detect_title(pages, base, raw_pages[0] if raw_pages else (), (doc.metadata or {}).get("title", ""))

    sections = []
    current = {"heading": "", "level": 0, "page": 0, "lines": [], "headingLines": []}
    heading_sizes = []
    started = False

    for pno, lines in enumerate(pages):
        index = 0
        while index < len(lines):
            line = lines[index]
            merged_heading = None
            heading_lines = [line]
            consumed = 1
            if SECTION_LABEL.fullmatch(classification_text(line["text"])):
                follow = lines[index + 1] if index + 1 < len(lines) else None
                same_row = follow and abs((follow["y0"] + follow["y1"]) / 2 - (line["y0"] + line["y1"]) / 2) <= max(2, line["size"] * .25)
                stacked = follow and 0 <= follow["y0"] - line["y1"] <= line["size"] * .65 and abs(follow["x0"] - line["x0"]) < 18
                size_match = follow and (abs(follow.get("dominantSize", follow["size"]) - line.get("dominantSize", line["size"])) <= .6 or same_row_heading_label(line, follow))
                if follow and not (line.get("_tableCell") or follow.get("_tableCell")) and (same_row or stacked) and size_match and (line.get("boldRatio", 0) >= .7 or line["size"] >= base * 1.08) and len(follow["text"]) <= 110 and not TERMINAL.search(follow["text"]):
                    merged_heading = line["text"] + " " + line_heading_text(follow)
                    heading_lines.append(follow)
                    consumed = 2
            heading_text = classification_text(merged_heading) if merged_heading else line_heading_text(line)
            runin_body = None
            split_heading, split_body = split_runin(heading_text)
            if split_heading:
                heading_text = split_heading
                runin_body = split_body
            candidate = dict(line)
            candidate["text"] = heading_text
            candidate["_headingText"] = heading_text
            candidate["_labelMerged"] = bool(merged_heading)
            if not is_heading(candidate, base, margin):
                current["lines"].append(line)
                index += 1
                continue
            # A wrapped heading remains a single entity. Only neighboring lines
            # with the same heading typography are joined, never normal prose.
            while consumed < 4 and index + consumed < len(lines):
                follow = lines[index + consumed]
                previous = heading_lines[-1]
                if SECTION_LABEL.fullmatch(classification_text(follow["text"])) or NUMBERED.match(line_heading_text(follow)) or CN_NUMBERED.match(line_heading_text(follow)):
                    break
                same_size = abs(follow.get("dominantSize", follow["size"]) - previous.get("dominantSize", previous["size"])) <= .35
                strong = (follow.get("boldRatio", 0) >= .8 and previous.get("boldRatio", 0) >= .8) or previous.get("dominantSize", previous["size"]) >= base * 1.15
                # A verified same-row numbered small-caps heading may wrap in
                # the same small-caps typography; ordinary all-cap prose may not.
                uniform_small_cap_tail = (bool(re.fullmatch(r"[A-Z][A-Z \-]{1,79}", follow["text"])) and
                                          abs(follow["size"] - previous.get("dominantSize", previous["size"])) <= .35)
                small_caps_continuation = (bool(merged_heading) and len(heading_lines) >= 2 and
                                           heading_lines[1].get("_smallCaps") and previous.get("_smallCaps") and
                                           (follow.get("_smallCaps") or uniform_small_cap_tail) and previous.get("font") == follow.get("font"))
                strong = strong or small_caps_continuation
                overlap_continuation = (chinese_blackface(previous.get("font", "")) and previous.get("font") == follow.get("font") and
                                        -previous["size"] * .65 <= follow["y0"] - previous["y1"] < -.5 and
                                        previous["size"] * .65 <= follow["y0"] - previous["y0"] <= previous["size"] * 2.2 and
                                        re.fullmatch(r"[\u4e00-\u9fff]{2,20}", follow["text"]))
                nearby = ((-.5 <= follow["y0"] - previous["y1"] <= max(7, previous["size"] * .6)) or overlap_continuation) and abs(follow["x0"] - previous["x0"]) < max(35, previous["size"] * 2)
                if not (same_size and strong and nearby) or caption_like(follow["text"]) or follow.get("_tableCell"):
                    break
                if len(heading_text + " " + follow["text"]) > 160:
                    break
                heading_lines.append(follow); consumed += 1
                separator = "" if overlap_continuation and re.search(r"[\u4e00-\u9fff]$", heading_text) and re.match(r"^[\u4e00-\u9fff]", follow["text"]) else " "
                heading_text = classification_text(heading_text + separator + line_heading_text(follow))
            known = bool(MAIN_HEADINGS.fullmatch(heading_text) or OTHER_HEADINGS.fullmatch(heading_text))
            numbered = bool(NUMBERED.match(heading_text) or CN_NUMBERED.match(heading_text))
            if not started:
                if pno == 0 and not (known or numbered):
                    index += 1
                    continue
                started = True
            heading_sizes.append(line["size"])
            if current["heading"]:
                sections.append(current)
            elif current["lines"] and (sections or (
                REFERENCE_HEADING.fullmatch(heading_text)
                and len({item["page"] for item in current["lines"]}) >= 2
            )):
                sections.append(current)
            current = {
                "heading": heading_text[:160],
                "level": 0,
                "page": line["page"],
                "lines": [],
                "headingLines": heading_lines,
                "headingLevel": line.get("_headingLevel"),
            }
            if runin_body:
                body_line = dict(line)
                body_line["text"] = runin_body
                current["lines"].append(body_line)
            index += consumed
    if current["lines"] or current["heading"]:
        sections.append(current)

    heading_ids = {line["id"] for section in sections for line in section.get("headingLines", [])}
    figures, tables = collect_captions(pages, heading_ids, document_id, geometry, base)
    caption_ids = {line_id for entry in [*figures, *tables] for line_id in entry.get("_lineIds", [])}
    table_content_ids = attach_table_content(pages, tables, document_id, geometry, base)
    floating_ids = caption_ids | table_content_ids
    reference_lines = collect_reference_lines(pages, base, margin, heading_ids, geometry)
    inferred_reference_ids = set()
    if not reference_lines:
        groups = infer_unheaded_reference_groups(pages, geometry)
        for group in groups:
            for position, line in enumerate(group):
                reference_lines.append({**line, "_referenceRegion": 1, "_inferredReferenceContinuation": position > 0})
                inferred_reference_ids.add(line["id"])
    out_sections = []
    for index, section in enumerate(sections):
        heading = section["heading"]
        level = 1
        if heading:
            match = NUMBERED.match(heading)
            if match:
                level = min(match.group(1).count(".") + 1, 4)
            elif CN_NUMBERED.match(heading):
                level = 1
            elif MAIN_HEADINGS.fullmatch(heading) and len(heading) <= 60:
                level = 1
            else:
                level = 2
        if REFERENCE_HEADING.match(heading):
            level = 1
        elif section.get("headingLevel"):
            level = section["headingLevel"]
        body = section["lines"]
        first_reference = next((position for position, line in enumerate(body) if line["id"] in inferred_reference_ids), None)
        # A verified headingless bibliography closes the current body section.
        # A later section with its own actual heading is still processed separately.
        if first_reference is not None:
            body = body[:first_reference]
        body_lines = [line for line in body if line["id"] not in floating_ids]
        paragraphs = split_paragraphs(body_lines, document_id, geometry) if not REFERENCE_HEADING.match(heading) else []
        entry = {
            "id": f"s{index + 1}", "level": level, "heading": heading,
            "page": section["page"], "paragraphs": paragraphs,
        }
        if section.get("headingLines"):
            evidence = section["headingLines"][0]
            entry["headingEvidence"] = {"font": evidence.get("font", ""), "size": evidence.get("dominantSize", evidence["size"]),
                                        "boldRatio": evidence.get("boldRatio"), "italicRatio": evidence.get("italicRatio"),
                                        "columnAligned": evidence.get("_aligned"), "gapBefore": round(evidence.get("_gapBefore", 0), 2),
                                        "basis": "full-line-typography-and-column-context"}
            if evidence.get("_headingNumbering"):
                entry["headingEvidence"].update({"numbering": evidence["_headingNumbering"], "numberingLabel": evidence["_headingLabel"],
                                                  "smallCaps": bool(evidence.get("_smallCaps")), "columnCentered": bool(evidence.get("_columnCentered"))})
                if evidence.get("_romanMain"):
                    entry["headingEvidence"]["basis"] = "roman-sequence-and-column-heading-typography"
        heading_lines = section.get("headingLines") or section["lines"][:1]
        quote = heading or (heading_lines[0]["text"] if heading_lines else "")
        attach_anchor(entry, "heading" if heading else "section-start", heading_lines, quote, document_id, geometry, preserve_id=True)
        out_sections.append(entry)

    references = parse_references(reference_lines, document_id, geometry)
    attach_mentions(pages, figures, tables, heading_ids | floating_ids | {line["id"] for line in reference_lines}, document_id, geometry)
    attach_asset_sections(figures, tables, out_sections)

    total_chars = sum(len(line["text"]) for lines in pages for line in lines)
    para_chars = sum(len(p["text"]) for s in out_sections for p in s["paragraphs"])
    delivered = [*out_sections, *(p for section in out_sections for p in section["paragraphs"]), *figures[:80], *tables[:80], *references[:300],
                 *(mention for entry in [*figures[:80], *tables[:80]] for mention in entry["mentions"]),
                 *(entry["content"] for entry in tables[:80] if entry.get("content"))]
    anchors = [entry["anchor"] for entry in delivered]
    empty_pages = [index for index, lines in enumerate(pages) if not lines]
    out = {
        "schemaVersion": 2,
        "parserVersion": PARSER_VERSION,
        "documentId": document_id,
        "coordinateSystem": {
            "id": "mupdf-unrotated-crop-pt-v1", "pageIndexBase": 0,
            "bbox": {"origin": "top-left", "space": "unrotated-crop-relative", "unit": "pt"},
            "pdfBBox": {"origin": "PDF user space", "space": "original-pdf-user-space", "unit": "PDF user unit"},
            "rendering": "Map pdfBBox with PDF.js viewport.convertToViewportRectangle; paint segments rather than the enclosing entity box.",
            "precision": "Visual line boxes, not character-level or graphic-region bounds.",
        },
        "pageGeometry": geometry,
        "diagnostics": ([{"code": "pages-without-text", "pages": empty_pages, "message": "No extractable text on these pages; OCR was not performed."}] if empty_pages else []),
        "title": title,
        "pages": doc.page_count,
        "bodySize": base,
        "sections": out_sections,
        "figures": figures[:80],
        "tables": tables[:80],
        "references": references[:300],
        "stats": {
            "chars": total_chars,
            "paragraphChars": para_chars,
            "coverage": round(para_chars / total_chars, 3) if total_chars else 0,
            "sectionCount": len(out_sections),
            "figureCount": len(figures),
            "tableCount": len(tables),
            "referenceCount": len(references),
            "mentionCount": sum(len(entry["mentions"]) for entry in [*figures, *tables]),
            "anchorCount": len(anchors),
            "locatedAnchorCount": sum(anchor["status"] == "located" for anchor in anchors),
            "partialAnchorCount": sum(anchor["status"] == "partial" for anchor in anchors),
            "unlocatedAnchorCount": sum(anchor["status"] == "unavailable" for anchor in anchors),
        },
    }
    doc.close()
    return out


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) < 2:
        print(json.dumps({"error": "missing pdf path"}))
        return
    print(json.dumps(extract_document(sys.argv[1]), ensure_ascii=False))


if __name__ == "__main__":
    main()
