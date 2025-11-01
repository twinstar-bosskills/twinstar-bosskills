import { withCache } from "@twinstar-bosskills/cache";
import { realmToExpansion } from "@twinstar-bosskills/core/dist/realm";
import { TWINSTAR_API_URL } from "./config";
import { raidsSchema, type Raid } from "./schema";

export const getRaidIconUrl = (name: string) => {
  return `/img/icon?type=raid&id=${encodeURIComponent(name).replace("'", "%27")}`;
};

export const getRemoteRaidIconUrl = (name: string) => {
  const lc = name.toLowerCase().replace("'", "").replace(/\s+/g, "-");
  // https://twinstar-api.twinstar-wow.com/img/raids/mogushan-vaults-small.avif
  return `${TWINSTAR_API_URL}/img/raids/${lc}-small.avif`;
};

type GetRaidsArgs = { realm: string };
const getRaidsRaw = async ({ realm }: GetRaidsArgs): Promise<Raid[]> => {
  const expansion = realmToExpansion(realm);
  const url = `${TWINSTAR_API_URL}/bosskills/raids?expansion=${expansion}`;

  try {
    const r = await fetch(url);
    const json = await r.json();
    const raids: Raid[] = raidsSchema.parse(json);
    for (const raid of raids) {
      for (let i = 0; i < raid.bosses.length; ++i) {
        const boss = raid.bosses[i]!;

        // MoP
        // remove Sul the Sandcrawler, Frost King Malakk and Kazra'jin
        if (
          boss.entry === 69131 ||
          boss.entry === 69134 ||
          boss.entry === 69078
        ) {
          raid.bosses = raid.bosses.filter(
            (b) => b.entry !== 69131 && b.entry !== 69134 && b.entry !== 69078,
          );
          continue;
        }

        // remove Elder Asani
        if (boss.entry === 60586) {
          raid.bosses = raid.bosses.filter((b) => b.entry !== 60586);
          continue;
        }

        // Cata
        // remove DS - Kohcrom
        if (boss.entry === 57773) {
          raid.bosses = raid.bosses.filter((b) => b.entry !== 57773);
          continue;
        }

        // remove FL - Rhyolith's duplicate?
        if (boss.entry === 54199) {
          raid.bosses = raid.bosses.filter((b) => b.entry !== 54199);
          continue;
        }

        // remove BoT - Theralion
        if (boss.entry === 45993) {
          raid.bosses = raid.bosses.filter((b) => b.entry !== 45993);
          continue;
        }

        // remove BWD - Arcanotron
        if (boss.entry === 42166) {
          raid.bosses = raid.bosses.filter((b) => b.entry !== 42166);
          continue;
        }

        // remove BWD - Toxitron
        if (boss.entry === 42180) {
          raid.bosses = raid.bosses.filter((b) => b.entry !== 42180);
          continue;
        }

        // remove BWD - Onyxia
        if (boss.entry === 41270) {
          raid.bosses = raid.bosses.filter((b) => b.entry !== 41270);
          continue;
        }

        // remove TotFW - Anshal
        if (boss.entry === 45870) {
          raid.bosses = raid.bosses.filter((b) => b.entry !== 45870);
          continue;
        }

        // remove TotFW - Rohash
        if (boss.entry === 45872) {
          raid.bosses = raid.bosses.filter((b) => b.entry !== 45872);
          continue;
        }
      }

      for (let i = 0; i < raid.bosses.length; ++i) {
        const boss = raid.bosses[i]!;

        // MoP - ToT
        if (boss.entry === 68905 || boss.entry === 68904) {
          raid.bosses[i]!.name = "Twin Consorts";
        }

        if (
          boss.entry === 69132 ||
          boss.entry === 69131 ||
          boss.entry === 69134 ||
          boss.entry === 69078
        ) {
          raid.bosses[i]!.name = "Council of Elders";
        }

        // MoP - ToES
        if (boss.entry === 60583) {
          raid.bosses[i]!.name = "Protectors of the Endless";
        }

        // MoP - MSV
        if (boss.entry === 59915) {
          raid.bosses[i]!.name = "Stone Guard";
        }

        if (boss.entry === 60701) {
          raid.bosses[i]!.name = "Spirit Kings";
        }

        if (boss.entry === 60399) {
          raid.bosses[i]!.name = "Will of the Emperor";
        }

        // Cata - DS
        if (boss.entry === 53879) {
          raid.bosses[i]!.name = "Spine of Deathwing";
        }

        if (boss.entry === 56173) {
          raid.bosses[i]!.name = "Madness of Deathwing";
        }

        // Cata - BoT
        if (boss.entry === 45992) {
          raid.bosses[i]!.name = "Theralion and Valiona";
        }

        if (boss.entry === 43735) {
          raid.bosses[i]!.name = "Ascendant Council";
        }

        // Cata - BWD
        if (boss.entry === 42179) {
          raid.bosses[i]!.name = "Omnotron Defense System";
        }

        // Cata - TotFW
        if (boss.entry === 45871) {
          raid.bosses[i]!.name = "The Conclave of Wind";
        }
      }
    }

    return raids;
  } catch (e) {
    console.error(e, url);
    throw e;
  }
};

export const getRaids = async ({
  realm,
  cache,
}: GetRaidsArgs & { cache?: boolean }): Promise<Raid[]> => {
  const fallback = async () => {
    return getRaidsRaw({ realm });
  };

  if (cache === false) {
    return fallback().catch((e) => {
      console.error(e);
      return [];
    });
  }

  return withCache({ deps: [`raids`, realm], fallback, defaultValue: [] });
};
