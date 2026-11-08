import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import {createHash,webcrypto} from 'node:crypto'
import {loadClient,read,sourceBlock,plain} from './helpers.mjs'
test('client loads offline and registers the Gloss sidebar and main panel',()=>{const client=loadClient(),slots=[];assert.equal(client.entry.id,'@local/literature-reader');client.plugin.apply({slots:{inject(_name,callback){callback()},register(record,component){slots.push(record);assert.equal(typeof component,'function')}}});assert.equal(slots.length,2);assert.ok(slots.some(slot=>slot.name==='main'&&slot.key==='literature'))})
test('document identity uses full SHA-256 bytes and the insecure-protocol fallback is equivalent',async()=>{const {api}=loadClient(),bytes=new Uint8Array([37,80,68,70,45,49,46,55,0,255,31]);const expected='pdf-'+createHash('sha256').update(bytes).digest('hex');assert.equal(await api.canonicalDocumentId('ignored title',bytes,webcrypto),expected);assert.equal(await api.canonicalDocumentId('another extraction',bytes,null),expected);const changed=bytes.slice();changed[changed.length-1]^=1;assert.notEqual(await api.canonicalDocumentId('ignored',changed,null),expected)})
test('identity migration preserves user prose and foreign nested conversations',()=>{const {api}=loadClient(),old='legacy-A',next='pdf-'+'c'.repeat(64);const snapshot={documentId:old,paper:{id:old,text:'User prose says legacy-A and must stay literal.'},ideas:[{id:'research-conversation:'+old,paperId:old,messages:[{paperId:'foreign-B',text:'Foreign retained'}]}],selectionThreads:[{documentId:old,key:'selected',quote:'Exact source'}]};const updated=api.rebindDocumentSnapshot(snapshot,old,next);assert.equal(updated.documentId,next);assert.equal(updated.paper.id,next);assert.equal(updated.paper.text,snapshot.paper.text);assert.equal(updated.ideas[0].paperId,next);assert.equal(updated.ideas[0].messages[0].paperId,'foreign-B');assert.equal(snapshot.documentId,old)})
test('translation shares inflight work, caches per paper, and ignores late chunks after cancellation',async()=>{let control,fetches=0;const encoder=new TextEncoder();const client=loadClient({fetch:async()=>{fetches++;return new Response(new ReadableStream({start(controller){control=controller}}),{status:200})}});const a=client.api.ensureTranslation('Synthetic source','A'),same=client.api.ensureTranslation('Synthetic source','A');assert.equal(a.record,same.record);assert.equal(fetches,1);const send=(event,data)=>control.enqueue(encoder.encode('event: '+event+'\ndata: '+JSON.stringify(data)+'\n\n'));const notice=new Promise(resolve=>a.record.listeners.add(value=>{if(value.done)resolve(value)}));send('delta',{text:'译文'});send('done',{text:'完整译文'});await notice;control.close();assert.equal(client.api.ensureTranslation('Synthetic source','A').cached,'完整译文');const foreign=client.api.ensureTranslation('Synthetic source','B');assert.equal(fetches,2);assert.notEqual(a.key,foreign.key);client.api.cancelTranslations('B');const before=foreign.record.text;send('delta',{text:'迟到'});send('done',{text:'迟到'});await new Promise(resolve=>setTimeout(resolve,5));assert.equal(foreign.record.text,before);assert.equal(foreign.record.controller.signal.aborted,true);control.close()})

test('the PDF title uses metadata only when matching a printed article below a publisher banner', async () => {
  const source = read('client.js')
  const join = sourceBlock(source, '    function joinText(', '    async function extractPdfText(')
  const title = sourceBlock(source, '    async function extractPdfTitle(', '\n    // ------------------------------------------------------------------\n    // IndexedDB')
  const extractPdfTitle = vm.runInNewContext(join + title + ';extractPdfTitle', {})
  const item = (str, y, height) => ({ str, height, transform: [height, 0, 0, height, 35, y] })
  const banner = item('Journal of Example Studies', 700, 14)
  const article = [
    item('A Printed Article Title', 620, 13.5),
    item('With a Verified Second Line', 602, 13.5),
  ]
  const publisher = [item('Contents lists available at ScienceDirect', 735, 8), banner,
    item('journal homepage: example.invalid', 660, 8), ...article]
  let metadataCalls = 0
  const pdf = (items, metadata) => ({
    async getPage() {
      return { getViewport: () => ({ height: 800 }), getTextContent: async () => ({ items }) }
    },
    async getMetadata() {
      metadataCalls += 1
      if (metadata instanceof Error) throw metadata
      return { info: { Title: metadata } }
    },
  })
  const verified = article.map(line => line.str).join(' ')
  assert.equal(await extractPdfTitle(pdf(publisher, verified)), verified)
  assert.equal(await extractPdfTitle(pdf(publisher, 'A Plausible Unprinted Article Title')), banner.str)
  assert.equal(await extractPdfTitle(pdf(publisher, new Error('Invalid PDF metadata'))), banner.str)
  assert.equal(await extractPdfTitle(pdf([banner, ...article], verified)), banner.str)
  assert.equal(metadataCalls, 3)
})
function navigation(){const source=read('client.js'),body=sourceBlock(source,'      async function locateText(','\n      function pairsFromMessages('),doc={},host={isConnected:true};let remembered=0,captured=0;const origin={host,doc,position:{documentId:'A',page:2,fraction:.25},token:'first'};const env={epochRef:{current:1},paperRef:{current:{id:'A'}},pdfDocRef:{current:doc},cancelReaderChromeFold(){},readerChromeFoldRef:{current:{}},referenceLocateRef:{current:0},pdfRestoreIntentRef:{current:0},pdfNavigationRef:{current:null},pdfRestoreRunRef:{current:null},pdfRestoringRef:{current:false},referenceOriginRef:{current:null},sourceRef:{current:host},locatorRef:{current:{locateAnchor:async()=>true,locate:async()=>false}},setSourceOpen(){},setSourceTab(){},setReferenceReturn(value){env.returnValue=value},captureReferenceOrigin(){captured++;return origin},rememberPdfPosition(){remembered++},setTimeout,Promise,String,Math};const locate=vm.runInNewContext(body+';locateText',env);return{env,locate,origin,get remembered(){return remembered},get captured(){return captured}}}
test('verified geometric locate failure never searches an unrelated duplicate heading',async()=>{const h=navigation();let globalSearches=0;h.env.locatorRef.current.locateAnchor=async()=>false;h.env.locatorRef.current.locate=async()=>{globalSearches++;return true};assert.equal(await h.locate('Method',{documentId:'A',status:'located',quoteVerified:true},{}),false);assert.equal(globalSearches,0);assert.equal(h.remembered,0)})
test('two source jumps keep the first return point; foreign-document jump does nothing',async()=>{const h=navigation();for(const title of['one','two'])assert.equal(await h.locate(title,{documentId:'A',status:'located',quoteVerified:true},{reference:true}),true);assert.equal(h.captured,1);assert.equal(h.env.referenceOriginRef.current,h.origin);assert.equal(h.env.returnValue.page,2);assert.equal(await h.locate('foreign',{documentId:'B',status:'located',quoteVerified:true},{}),false);assert.equal(h.remembered,2)})
test('manual input during a pending locate prevents a late position commit',async()=>{const h=navigation();let complete;h.env.locatorRef.current.locateAnchor=()=>new Promise(resolve=>complete=resolve);const pending=h.locate('one',{documentId:'A',status:'located',quoteVerified:true},{});h.env.pdfRestoreIntentRef.current++;h.env.pdfNavigationRef.current=null;complete(true);assert.equal(await pending,false);assert.equal(h.remembered,0)})

test('a PDF excerpt can cross consecutive page boundaries only with a verified tail and head', () => {
  const source = read('client.js')
  const matching = sourceBlock(source, '    function matchKey(value)', '    function PdfPage(props)')
  const { matchKeyText, adjacentPdfQuoteParts } = vm.runInNewContext(matching + ';({matchKeyText, adjacentPdfQuoteParts})')
  const first = matchKeyText('Earlier text. The ﬁrst half［3］')
  const second = matchKeyText('continues here. Next sentence.')
  const quote = matchKeyText('The first half[3] continues here.')
  assert.deepEqual(plain(adjacentPdfQuoteParts(first, second, quote, 5)), [
    { page: 4, edge: 'end', key: matchKeyText('The first half[3]') },
    { page: 5, edge: 'start', key: matchKeyText('continues here.') },
  ])
  assert.equal(adjacentPdfQuoteParts(first + 'footer', second, quote, 5), null)
  assert.equal(adjacentPdfQuoteParts(first, '', quote, 5), null)
})

test('a long PDF excerpt scrolls into the viewport even if the usual top inset would clip it', () => {
  const source = read('client.js')
  const scroll = sourceBlock(source, '      function scrollPdfTarget(', '      function locatePage(')
  const viewport = { top: 0, bottom: 300, height: 300 }
  const container = { isConnected: true, clientHeight: 300, scrollHeight: 2000, scrollTop: 0, getBoundingClientRect: () => viewport }
  const target = { getBoundingClientRect: () => ({ top: 600 - container.scrollTop, bottom: 860 - container.scrollTop, height: 260 }) }
  const scrollPdfTarget = vm.runInNewContext(scroll + ';scrollPdfTarget', { hostRef: { current: { closest: () => container } } })
  assert.equal(scrollPdfTarget(target, .26), true)
  assert.equal(container.scrollTop, 560)
})
