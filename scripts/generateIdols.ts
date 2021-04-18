import fetch from 'node-fetch';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';

const modifyBrand = (brand: string): string =>
  [
    '765AS',
    'CinderellaGirls',
    'MillionLive',
    'SideM',
    'ShinyColors',
    'Other',
  ].includes(brand)
    ? brand
    : 'Other';

const query = `
PREFIX schema: <http://schema.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX imas: <https://sparql.crssnky.xyz/imasrdf/URIs/imas-schema.ttl#>

SELECT ?name ?kana ?brand ?url
WHERE {
  ?s a imas:Idol ;
    rdfs:label ?name ;
    imas:Brand ?brand .
  OPTIONAL { ?s imas:IdolListURL ?url }
  OPTIONAL { ?s imas:alternateNameKana ?tmp } # ロコ・ジュリア・他対策
  OPTIONAL { ?s imas:nameKana ?tmp }
  OPTIONAL { ?s imas:givenNameKana ?tmp } # 詩花・玲音対策
  BIND(IF(?name = "エミリー", "えみりー", ?tmp) AS ?kana) # エミリー対策
  FILTER(?brand != "1stVision"@en || ?brand != "Xenoglossia"@en)
  FILTER(?s != <https://sparql.crssnky.xyz/imasrdf/RDFs/detail/Akizuki_Ryo_876>)
}
ORDER BY ?kana
`;

(async () => {
  const url = new URL('https://sparql.crssnky.xyz/spql/imas/query');
  url.searchParams.set('output', 'json');
  url.searchParams.set('query', query);

  const json = await fetch(url).then((res) => res.json());
  const idols = json.results.bindings.map(
    (binding: Record<string, { value: string }>) => ({
      name: binding.name.value,
      kana: binding.kana.value,
      brand: modifyBrand(binding.brand.value),
      url: binding.url?.value,
    })
  );

  fs.writeFileSync(
    path.resolve(__dirname, '../public/idols.json'),
    JSON.stringify(idols, null, 2) + '\n'
  );
})();
