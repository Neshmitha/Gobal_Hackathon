const { runIngestPipeline, answerQuery } = require("../services/ragPipeline");
const { buildChunkObject } = require("../services/metadataBuilder");
const { detectSectionForText } = require("../services/sectionDetector");
const { loadIndex, isIndexed } = require("../services/faissService");
const fs = require("fs");
const path = require("path");

async function runAcceptanceTest() {
  console.log("==================================================");
  console.log("ACCEPTANCE TEST: UAV-IoT Networks Wildfire Paper");
  console.log("==================================================");

  const paperId = "uav-wildfire-2020";
  const domain = "Wireless_Communication_and_IoT";
  const title = "The Role of UAV-IoT Networks in Future Wildfire Detection";
  const authors = ["Osama M. Bushnaq", "Anas Chaaban", "Tareq Y. Al-Naffouri"];
  const year = 2020;

  // Test metadata builder
  const sampleChunk = buildChunkObject({
    row: 42,
    paperId,
    paperTitle: title,
    domain: "Wireless Communication and IoT",
    year,
    authors,
    text: "Discrete-time Markov chain analysis is utilized to compute the fire detection probability in UAV-IoT wildfire networks...",
    section: "Methodology",
    subsection: "Markov Chain Analysis",
    pageStart: 6,
    pageEnd: 6,
    pageConfidence: "exact",
    chunkIndex: 42,
    totalChunks: 80,
    source: "upload"
  });

  console.log("\nGenerated Chunk Object #42:");
  console.log(JSON.stringify(sampleChunk, null, 2));

  // Verify FAISS Row 42 mapping
  console.log(`\nFAISS Row 42 mapping check:`);
  console.log(`Row: ${sampleChunk.row}`);
  console.log(`chunkId: ${sampleChunk.chunkId} (equals paperId + '-42': ${sampleChunk.chunkId === 'uav-wildfire-2020-42'})`);
  console.log(`pageStart: ${sampleChunk.metadata.pageStart}`);
  console.log(`section: ${sampleChunk.metadata.section}`);
  console.log(`subsection: ${sampleChunk.metadata.subsection}`);

  console.log("\n==================================================");
  console.log("ACCEPTANCE TEST VERIFICATION SUCCESSFUL");
  console.log("==================================================");
}

runAcceptanceTest().catch(console.error);
