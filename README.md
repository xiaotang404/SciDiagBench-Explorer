# Scientific Diagram Gallery

The gallery currently contains 1902 diagrams, with 10 research domains, 11 diagram types, keyword search and detailed views.

## Data format

`data.js` stores the gallery data as `window.GALLERY_DATA = <JSON>;`, which the local HTML page loads directly.

The root object contains `name`, `domains`, `classes` and `diagrams`. `domains` stores each domain's `id` and `name`; `classes` stores the diagram type names. Each diagram record has the following required fields, in order: `id`, `diagram`, `class`, `domain`, `title`, `venue`, `authors`, `figure`, `caption`, `sourceUrl`, `license`, `licenseUrl` and `condition`.

`venue` identifies the article's journal or conference, for example `Nature Communications`, `ICML 2025` or `Findings of ACL 2025`. Workshop papers include the workshop name. This value appears at the right of the card's diagram-type row, in the detailed view and in Attribution downloads, and is included in keyword search. Long names wrap within the card.

All 1902 records have a `venue`, checked in ten batches of up to 200 on 2026-10-15. Four diagrams are explicitly labeled as preprints, and one OpenReview submission uses `OpenReview (publication unconfirmed)` because a published venue could not be established. These labels describe available evidence; they do not assert that a paper has never been published. The source of an openly licensed image can remain arXiv or Research Square even when `venue` names a formal publication. A submission, rejection, publisher name or preprint template alone does not establish a publication venue.

`venue_sources.json` records the bibliographic evidence and classification for each unique source URL. Journal names come from exact DOI matches in Europe PMC or Crossref; conference names come from archived official publication pages and arXiv publication statements. ACL Findings and NeurIPS workshops are distinguished from the main conference. The evidence file is for maintenance and is not loaded by the webpage. Local archive paths are relative to the parent workspace. Preprint and unconfirmed labels should be revisited when new publication evidence becomes available.

Only `copyright` and `scores` are optional. Currently, 69 records have scores. Cards with scores appear first, sorted by `scores.total` in descending order.

`condition` retains sharing conditions, full attribution, asset creators, source links, version correspondence notes and processing notes. `copyright` retains applicable copyright notices and tool acknowledgments. Sharing conditions, copyright explanations and license labels are in English. Author names use Latin script; redundant Chinese name variants are omitted, and names provided only in Chinese are romanized.

## Files and maintenance

- `index.html`, `styles.css`, `app.js`, `lucide.min.js`: the webpage and icons.
- `data.js`: gallery data.
- `venue_sources.json`: publication venue evidence and review status.
- `diagram/`: 1902 original diagrams.
- `diagram_map.jsonl`, `extract_scores.jsonl`: scoring weights and original scores, retained for reference. The site does not read these two files at runtime.

To update the data, edit `data.js` directly; the page reads the records and scores it contains.

To use Attribution downloads locally, start a static server in this directory and visit `http://localhost:8000`:

```text
python -m http.server 8000
```

To add a diagram, place its image in this directory's `diagram/` folder and add a record matching the format above to the `diagrams` array in `data.js`. Ensure the ID is unique, the type and domain are valid, and the image path is correct.

Attribution downloads include the text caption, full sharing conditions and copyright notices, domain name and original image as `imageBase64`. Opening the HTML file directly allows browsing, but browsers restrict local file reads, so downloading displays a prompt to access the gallery through a local server or website.
