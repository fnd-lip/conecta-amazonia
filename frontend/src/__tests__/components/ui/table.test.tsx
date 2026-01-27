import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

// Mock cn
jest.mock("@/lib/utils", () => ({
  __esModule: true,
  cn: (...classes: Array<string | undefined | false>) =>
    classes.filter(Boolean).join(" "),
}));

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("Table (ui)", () => {
  it("Table renderiza um container + table com data-slot e classes base + extra", () => {
    render(
      <Table className="tbl-extra" aria-label="tabela">
        <tbody />
      </Table>
    );

    const container = document.querySelector(
      '[data-slot="table-container"]'
    ) as HTMLDivElement | null;
    expect(container).not.toBeNull();
    expect(container?.className).toContain("overflow-x-auto");

    const table = document.querySelector(
      '[data-slot="table"]'
    ) as HTMLTableElement | null;
    expect(table).not.toBeNull();
    expect(table).toHaveAttribute("aria-label", "tabela");

    const cls = table?.getAttribute("class") || "";
    expect(cls).toContain("w-full");
    expect(cls).toContain("caption-bottom");
    expect(cls).toContain("text-sm");
    expect(cls).toContain("tbl-extra");
  });

  it("TableHeader / TableBody / TableFooter aplicam data-slot e classes base + extra", () => {
    render(
      <Table>
        <TableHeader className="hdr-extra">
          <tr>
            <th>H</th>
          </tr>
        </TableHeader>
        <TableBody className="body-extra">
          <tr>
            <td>B</td>
          </tr>
        </TableBody>
        <TableFooter className="ftr-extra">
          <tr>
            <td>F</td>
          </tr>
        </TableFooter>
      </Table>
    );

    const thead = document.querySelector(
      '[data-slot="table-header"]'
    ) as HTMLTableSectionElement | null;
    expect(thead).not.toBeNull();
    expect(thead?.getAttribute("class") || "").toContain("[&_tr]:border-b");
    expect(thead?.getAttribute("class") || "").toContain("hdr-extra");

    const tbody = document.querySelector(
      '[data-slot="table-body"]'
    ) as HTMLTableSectionElement | null;
    expect(tbody).not.toBeNull();
    expect(tbody?.getAttribute("class") || "").toContain(
      "[&_tr:last-child]:border-0"
    );
    expect(tbody?.getAttribute("class") || "").toContain("body-extra");

    const tfoot = document.querySelector(
      '[data-slot="table-footer"]'
    ) as HTMLTableSectionElement | null;
    expect(tfoot).not.toBeNull();
    const fcls = tfoot?.getAttribute("class") || "";
    expect(fcls).toContain("bg-muted/50");
    expect(fcls).toContain("border-t");
    expect(fcls).toContain("font-medium");
    expect(fcls).toContain("ftr-extra");
  });

  it("TableRow / TableHead / TableCell aplicam data-slot e classes base + extra", () => {
    render(
      <Table>
        <TableBody>
          <TableRow className="row-extra">
            <TableHead className="head-extra">Col</TableHead>
            <TableCell className="cell-extra">Val</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const tr = screen.getByText("Col").closest('[data-slot="table-row"]');
    expect(tr).toBeInTheDocument();
    const trCls = tr?.getAttribute("class") || "";
    expect(trCls).toContain("border-b");
    expect(trCls).toContain("transition-colors");
    expect(trCls).toContain("row-extra");

    const th = screen.getByText("Col");
    expect(th).toHaveAttribute("data-slot", "table-head");
    const thCls = th.getAttribute("class") || "";
    expect(thCls).toContain("h-10");
    expect(thCls).toContain("text-left");
    expect(thCls).toContain("head-extra");

    const td = screen.getByText("Val");
    expect(td).toHaveAttribute("data-slot", "table-cell");
    const tdCls = td.getAttribute("class") || "";
    expect(tdCls).toContain("p-2");
    expect(tdCls).toContain("align-middle");
    expect(tdCls).toContain("cell-extra");
  });

  it("TableCaption renderiza caption com data-slot e classes base + extra", () => {
    render(
      <Table>
        <TableCaption className="cap-extra">Legenda</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const caption = screen.getByText("Legenda");
    expect(caption).toHaveAttribute("data-slot", "table-caption");
    const cls = caption.getAttribute("class") || "";
    expect(cls).toContain("text-muted-foreground");
    expect(cls).toContain("mt-4");
    expect(cls).toContain("cap-extra");
  });

  it("Table repassa props extras para o <table> (ex.: id)", () => {
    render(
      <Table id="t1">
        <tbody />
      </Table>
    );

    const table = document.querySelector('[data-slot="table"]');
    expect(table).toHaveAttribute("id", "t1");
  });
});
