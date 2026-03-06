import {
  insertCandidate,
  insertManyCandidates,
  deleteCandidate,
  printCandidates,
  editcandidate,
} from "../db/index.js";

export async function createCandidate(payload) {
  return insertCandidate(payload);
}

export async function createManyCandidates(payload, options = {}) {
  return insertManyCandidates(payload, options);
}

export async function removeCandidate(candidateId) {
  return deleteCandidate(candidateId);
}

export async function updateCandidate(candidateId, payload) {
  return editcandidate(candidateId, payload);
}

export async function listCandidates({ limit = 0, job, college, debug = false } = {}) {
  return printCandidates({ limit, job, college, debug });
}
