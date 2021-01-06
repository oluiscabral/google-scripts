function get_tables($) {
  let tables = []
  $('.cr_dataTable').each((i, element) => {
    let t = $(element);
    let table = []
    t.children().children().each((i, element) => {
      let e = $(element);
      let row = []
      if (e.attr('class') != 'hide') {
        e.children().each((i, element) => {
          let eChild = $(element);
          if (eChild.attr('class') != 'data_smallgraph') {
            row.push(eChild.text());
          }
        });
      }
      if (row.length != 0) {
        table.push(row);
      }
    });
    tables.push(table)
  });
  return tables;
}

function get_header($) {
  var header = [];
  const headerDiv = $('.cr_quotesHeader h1').first();
  headerDiv.children().each((i, element) => {
    const e = $(element);
    header.push(e.text());
  });
  return header.join(' ');
}

function fill_sheet(sheet, date, url, titles) {
  sheet.clear();
  const $ = Cheerio.load(UrlFetchApp.fetch(url).getContentText());
  var tables = get_tables($);
  if (tables.length == 0) {
    throw "Did not find any table in " + url;
  }

  sheet.appendRow([get_header($), date]);
  sheet.appendRow([' ']);

  tables.forEach((array, i) => {
    var title = null;
    if (i < titles.length) {
      title = titles[i];
    }
    if (title != null) {
      title.forEach((value) => {
        sheet.appendRow(value);
      });
    }
    array.forEach((array, i) => {
      sheet.appendRow(array);
    });
  });
}

function get_empty_sheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (sheet == null) {
    return ss.insertSheet(name);
  } else {
    sheet.clear();
    return sheet;
  }
}

function get_date() {
  var today = new Date();
  return today.getMonth() + 1 + "/" + today.getDate() + "/" + today.getFullYear();
}

function create_stock_valuations(ss, ticker) {
  const balance_sheet = get_empty_sheet(ss, "Balance Sheet");
  const income_sheet = get_empty_sheet(ss, "Income Statement");
  const cash_sheet = get_empty_sheet(ss, "Cash Flows");

  const date = get_date();
  fill_sheet(balance_sheet, date, "https://www.wsj.com/market-data/quotes/AU/XASX/" + ticker + "/financials/annual/balance-sheet", [[["Assets"]], [[""], ["Liabilities & Shareholders' Equity"]]]);
  fill_sheet(income_sheet, date, "https://www.wsj.com/market-data/quotes/AU/XASX/" + ticker + "/financials/annual/income-statement", [[["QUARTERLY"], ["ANNUAL"]]]);
  fill_sheet(cash_sheet, date, "https://www.wsj.com/market-data/quotes/AU/XASX/" + ticker + "/financials/annual/cash-flow", [[["QUARTERLY"], ["ANNUAL"]]]);
}

function main(ticker) {
  create_stock_valuations(SpreadsheetApp.getActiveSpreadsheet(), ticker);
}

function edit(e) {
  var langName = 'Enter Data';
  var langCell = 'C2';

  var curSheet = e.range.getSheet();

  if (curSheet.getName() === langName) {
    if (e.range.getA1Notation() === langCell) {
      main(e.value);
    }
  }
}
