/**
 * Which card mesh a piece of content paints with.
 *
 * Built-in passages name their mesh. Anything else (custom passages, drills,
 * generated practice) keeps its stored `artwork` untouched — Convex validates
 * that shape — and is assigned a mesh from its id, so the same passage always
 * lands on the same palette.
 *
 * PURE module — no React. Safe under bun.
 */

import { MESH_NAMES, type MeshName } from '@/constants/atmosphere';
import type { Passage } from '@/types/session';

function hash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function meshFor(passage: Pick<Passage, 'id' | 'mesh'>): MeshName {
  return passage.mesh ?? MESH_NAMES[hash(passage.id) % MESH_NAMES.length];
}
