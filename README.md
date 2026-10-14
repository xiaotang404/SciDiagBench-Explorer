# Scientific Diagram Gallery

The gallery currently contains 1902 diagrams, with 10 research domains, 11 diagram types, keyword search and detailed views.

## Data format

`data.js` stores the gallery data as `window.GALLERY_DATA = <JSON>;`, which the local HTML page loads directly.

The root object contains `name`, `domains`, `classes` and `diagrams`. `domains` stores each domain's `id` and `name`; `classes` stores the diagram type names. Each diagram record has the following required fields, in order: `id`, `diagram`, `class`, `domain`, `title`, `authors`, `figure`, `caption`, `sourceUrl`, `license`, `licenseUrl` and `condition`.

Only `copyright` and `scores` are optional. Currently, 69 records have scores. Cards with scores appear first, sorted by `scores.total` in descending order.

`condition` retains sharing conditions, full attribution, asset creators, source links, version correspondence notes and processing notes. `copyright` retains applicable copyright notices and tool acknowledgments. Sharing conditions, copyright explanations and license labels are in English. Author names use Latin script; redundant Chinese name variants are omitted, and names provided only in Chinese are romanized.

## Files and maintenance

- `index.html`, `styles.css`, `app.js`, `lucide.min.js`: the webpage and icons.
- `data.js`: gallery data.
- `diagram/`: 1902 original diagrams.
- `diagram_map.jsonl`, `extract_scores.jsonl`: scoring weights and original scores, retained for reference. The site does not read these two files at runtime.

To update the data, edit `data.js` directly; the page reads the records and scores it contains.

To use Attribution downloads locally, start a static server in this directory and visit `http://localhost:8000`:

```text
python -m http.server 8000
```

To add a diagram, place its image in this directory's `diagram/` folder and add a record matching the format above to the `diagrams` array in `data.js`. Ensure the ID is unique, the type and domain are valid, and the image path is correct.

Attribution downloads include the text caption, full sharing conditions and copyright notices, domain name and original image as `imageBase64`. Opening the HTML file directly allows browsing, but browsers restrict local file reads, so downloading displays a prompt to access the gallery through a local server or website.
