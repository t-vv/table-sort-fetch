import "./style.css";
import * as axe from "axe-core";

{
  // Sorting Data Table
  const dataFinancial = (e) => {
    const down_class = " dir-d ";
    const up_class = " dir-u ";
    const regex_dir = / dir-(u|d) /;
    const regex_table = /\bsortable\b/;
    const element = e.target;

    const reclassify = (element, dir) => {
      element.className = element.className.replace(regex_dir, "") + dir;
    }

    if (element.nodeName == "SPAN") {
      element = element.parentNode;
    }
    if (element.nodeName == "BUTTON") {
      let table = element.offsetParent.offsetParent;

      if (regex_table.test(table.className)) {
        let column_index;
        let tr = element.parentNode.parentNode;
        let nodes = tr.cells;

        // reset thead cells and get column index
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i] === element.parentNode) {
            column_index = i;
          } else {
            reclassify(nodes[i].querySelector("button"), "");
          }
        }

        let dir = up_class;

        // check if we're sorting up or down, and update the css accordingly
        if (element.className.indexOf(up_class) !== -1) {
          dir = down_class;
        }

        reclassify(element, dir);

        // extract all table rows, so the sorting can start
        let org_tbody = table.tBodies[0];
        let rows = [].slice.call(org_tbody.cloneNode(true).rows, 0);
        let reverse = dir == up_class;

        rows.sort((a, b) => {
          a = a.cells[column_index].querySelector(".sort").innerText;
          b = b.cells[column_index].querySelector(".sort").innerText;

          if (a.includes("$")) {
            a = Number(a.replace(/[^0-9\.]+/g, ""));
            b = Number(b.replace(/[^0-9\.]+/g, ""));
          }

          if (reverse) {
            let c = a;
            a = b;
            b = c;
          }

          return isNaN(a - b) ? a.localeCompare(b) : a - b;
        });

        let clone_tbody = org_tbody.cloneNode();

        for (let i = 0; i < rows.length; i++) {
          clone_tbody.appendChild(rows[i]);

          if (rows[i].hasAttribute("aria-live")) {
            rows[i].removeAttribute("aria-live");
          }
        }

        table.replaceChild(clone_tbody, org_tbody);
      }
    }
  }

  // Load More Financial Data
  const getMoreFinData = () => {
    const finGrid = document.getElementsByClassName("sortable");
    const foot = finGrid[0].getElementsByTagName("tfoot");

    let request = new Request(
      "https://tadams-data.s3.us-east-1.amazonaws.com/testData.json"
    );
    fetch(request)
      .then(response => response.json())
      .then(data => {
        const tableBody = finGrid[0].getElementsByTagName("tbody")[0];
        data.finData.map((finDetails, i, finArr) => {
          //const newRow = tableBody.insertRow();
          tableBody.insertAdjacentHTML(
            "beforeend",
            `<tr aria-live="polite">
              <td>
                <a href="https://www.yahoo.com/" target="_blank" class="sort" aria-describedby="link-new-window">${
            finDetails.accntType
            }</a>
              </td>
              <td>
                <div class="sort">${finDetails.value}</div>
                <div class="${finDetails.change[0] == '+' ? 'pos' : 'neg'}">${
            finDetails.change
            }</div>
              </td>
            </tr>`
          );
        });
        tableBody.rows[tableBody.rows.length - data.finData.length]
          .getElementsByTagName("a")[0]
          .focus();
        finGrid[0].removeChild(foot[0]);
      });
  }

  // Event Listeners
  const moreD = document.querySelector(".get-more").addEventListener("click", () => {
    getMoreFinData();
  });

  const sortD = document
    .querySelector(".sortable > thead")
    .addEventListener("click", (e) => {
      dataFinancial(e);
    });

  axe.run(document, (err, results) => {
    if (err) throw err;
    console.log(results);
  });
}
