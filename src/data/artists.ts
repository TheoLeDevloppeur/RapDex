import type { Genre } from '@/theme/theme';

import rawArtists from './artists.json';

export type Artist = {
  /** Numéro RapDex, affiché « #014 » sur la carte. */
  no: number;
  /** Identifiant stable, enregistré dans la collection de l'utilisateur. */
  id: string;
  name: string;
  genre: Genre;
};

/**
 * La base d'artistes de la V1, intégrée à l'app.
 *
 * Règle : on ajoute de nouveaux artistes à la fin de artists.json, sans jamais
 * modifier le `no` ni l'`id` d'un artiste existant. Les collections déjà
 * enregistrées sur les téléphones référencent ces identifiants.
 */
export const ARTISTS: readonly Artist[] = rawArtists as Artist[];

const byId = new Map(ARTISTS.map((a) => [a.id, a]));

export function getArtist(id: string): Artist | undefined {
  return byId.get(id);
}
