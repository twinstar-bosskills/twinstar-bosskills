import { withCache } from "@twinstar-bosskills/cache";
import {
  REALM_KRONOS,
  realmToExpansion,
} from "@twinstar-bosskills/core/dist/realm";
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
    let raids: Raid[] = raidsSchema.parse(json);
    for (const raid of raids) {
      for (let i = 0; i < raid.bosses.length; ++i) {
        const boss = raid.bosses[i]!;

        // MoP
        // remove Wavebinder Kardris
        if (boss.entry === 71858) {
          raid.bosses = raid.bosses.filter((b) => b.entry !== 71858);
          continue;
        }

        // remove Rook Stonetoe, He Softfoot, keep only Sun Tenderheart
        if (boss.entry === 71475 || boss.entry === 71479) {
          raid.bosses = raid.bosses.filter(
            (b) => b.entry !== 71475 && b.entry !== 71479,
          );
          continue;
        }

        // remove Lu'lin, keep only Suen
        if (boss.entry === 68904) {
          raid.bosses = raid.bosses.filter((b) => b.entry !== 68904);
          continue;
        }

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

        // MoP - SoO
        if (boss.entry === 71858 || boss.entry === 71859) {
          raid.bosses[i]!.name = "Kor'kron Dark Shaman";
        }

        if (boss.entry === 72276) {
          raid.bosses[i]!.name = "Norushen";
        }

        if (
          boss.entry === 71475 ||
          boss.entry === 71479 ||
          boss.entry === 71480
        ) {
          raid.bosses[i]!.name = "The Fallen Protectors";
        }

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

    if (realm.toLowerCase() === REALM_KRONOS.toLowerCase()) {
      // keep only "real" raids
      const VANILLA_RAIDS: Record<string, boolean> = {
        "Molten Core": true,
        "Onyxia's Lair": true,
        "Blackwing Lair": true,
        "Zul'Gurub": true,
        "Ahn'Qiraj Temple": true,
        "Ruins of Ahn'Qiraj": true,
        Naxxramas: true,
      };
      return raids.filter(
        (raid) => typeof VANILLA_RAIDS[raid.map] !== "undefined",
      );
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
