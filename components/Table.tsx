'use client'
import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor
} from "@nextui-org/react";
import { ChevronDownIcon } from "./icons/ChevronDownIcon";
import { SearchIcon } from "./icons/SearchIcon";
import { capitalize } from "../utils/utils";

import lorenzoniLogo from "../assets/lorenzoniLogo.png";

const statusColorMap: Record<string, ChipProps["color"]> = {
  done: "success",
  pending: "warning"
};

const INITIAL_VISIBLE_COLUMNS = ["actions", "status", "userid", "date", "product_code", "documentN", "product_quantity", "claim_reason"];


interface Claim {
  id: number;
  userid: string;
  name: string;
  date: string;
  product_code: string;
  documentN: string;
  product_quantity: number;
  claim_reason: string;
  status: string;
}

const columns = [
  { name: "Actions", uid: "actions", sortable: false },
  { name: "userid", uid: "userid", sortable: false },
  { name: "Name", uid: "name", sortable: false },
  { name: "Status", uid: "status", sortable: false },
  { name: "Date", uid: "date", sortable: true },
  { name: "Product code", uid: "product_code", sortable: false },
  { name: "Document N.", uid: "documentN", sortable: false },
  { name: "Product quantity", uid: "product_quantity", sortable: true },
  { name: "Claim reason", uid: "claim_reason", sortable: false }
]

export default function App() {
  const [filterValue, setFilterValue] = React.useState("");
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "status",
    direction: "ascending",
  });
  const [claims, setClaims] = React.useState<Claim[]>([]);
  const [page, setPage] = React.useState(1);
  const [toSearchFilterValue, setToSearchFilterValue] = React.useState("");
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [openModal, setOpenModal] = React.useState<number>(-1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);


  const pages = Math.ceil(total / rowsPerPage);

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("columnsearch", "product_code");
    params.append("valuesearch", filterValue);
    params.append("limit", rowsPerPage.toString());
    params.append("offset", ((page - 1) * rowsPerPage).toString());

    fetch(`/api?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'authorization': localStorage.getItem('token') || ''
      }
    }).then(response => {
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      return response.json();
    }).then(data => {
      if (data) {
        setClaims(data.rows);
        setTotal(data.total);
      }
      setLoading(false);
    });
  }, [toSearchFilterValue, page, rowsPerPage]);

  function doneRow(_id: number) {
    fetch(`/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': localStorage.getItem('token') || ''
      },
      body: JSON.stringify({ id: _id })
    }).then((response) => {
      if (response.status === 401) {
        window.location.href = '/login';
      }
      if (response.ok) {
        setClaims(claims.map(claim => {
          if (claim.id === _id) {
            return { ...claim, status: 'done' };
          }
          return claim;
        }));
      }
    })
  }


  const renderCell = React.useCallback((claim: Claim, columnKey: React.Key) => {
    const cellValue = claim[columnKey as keyof Claim];

    switch (columnKey) {
      case "userid":
        return cellValue;
      case "name":
        return cellValue;
      case "date":
        return new Date(cellValue).toISOString().split('T')[0];
      case "product_code":
        return cellValue;
      case "documentN":
        return cellValue;
      case "product_quantity":
        return cellValue;
      case "claim_reason":
        return cellValue;
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[claim.status]} size="sm" variant="flat">
            {cellValue}
          </Chip>
        );
      default:
        return cellValue;
    }
  }, [claims]);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("")
    setPage(1)
  }, [])

  const topContent = React.useMemo(() => {
    return (
      <div id="topContent" className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <div className="flex items-center flex-1 gap-1">
            <img src={lorenzoniLogo.src} alt="logo" className="h-[3em] mr-3" />
            <Input
              isClearable
              className="w-full sm:max-w-[44%]"
              placeholder="Search by product code..."
              startContent={<SearchIcon />}
              value={filterValue}
              onClear={() => onClear()}
              onChange={(e) => setFilterValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setToSearchFilterValue(filterValue);
                }
              }}
            />
            <div role='presentation' className="hover:bg-secondary-100 h-full p-[1em] rounded-md cursor-pointer" onClick={() => {
              setToSearchFilterValue(filterValue);
            }}>
              <SearchIcon />
            </div>
          </div>
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDownIcon className="text-small" />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {total} claims</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    total,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div id="bottomContent" className="py-2 px-2 flex justify-between items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [total, page, pages, hasSearchFilter]);

  return (
    <>
      {openModal > -1 ? <div role='presentation' id="modal" className="absolute flex justify-center items-center top-0 left-0 h-screen w-screen z-[100] bg-[rgba(0,0,0,0.5)]" onClick={() => setOpenModal(-1)}>
        <div role='presentation' className="h-[70%] w-[80%] max-w-[700px] bg-[#ffffff] rounded-lg p-[3%]" onClick={(e) => e.stopPropagation()}>
          {claims.map((claim, index) => {
            if (claim.id === openModal) {
              return (
                <div key={index} className="flex flex-col gap-3 h-full">
                  <div className="flex justify-between items-center">
                    <h1 className=" text-2xl">Claim</h1>
                    <Button variant="flat" size="sm" onClick={() => setOpenModal(-1)}>Close</Button>
                  </div>
                  <div className="flex flex-col gap-2 h-full">
                    <div className="flex gap-2">
                      <span className="font-bold">User ID:</span>
                      <span className="">{claim.userid}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">Status:</span>
                      <Chip className="capitalize" color={statusColorMap[claim.status]} size="sm" variant="flat">
                        {claim.status}
                      </Chip>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">Name:</span>
                      <span className="">{claim.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">Date:</span>
                      <span className="">{new Date(claim.date).toISOString().split('T')[0]}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">Product code:</span>
                      <span className="">{claim.product_code}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">Document N.:</span>
                      <span className="">{claim.documentN}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold">Product quantity:</span>
                      <span className="">{claim.product_quantity}</span>
                    </div>
                    <div className="flex gap-2 flex-col flex-1 overflow-hidden">
                      <span className="font-bold">Claim reason:</span>
                      <div className="bg-[#cacaca] rounded-lg flex-1 p-[2%] overflow-scroll mb-[10%]">
                        <p className="">{claim.claim_reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div> : null}
      <Table
        aria-label="Example table with custom cells, pagination and sorting"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "",
        }}
        className="h-screen p-[2%]"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        {!loading ?
          <TableBody emptyContent={"No claims found"} className="flex-1">
            {claims.map((claim, index) => {
              return (
                <TableRow key={index} className="hover:bg-primary-100 cursor-pointer" onClick={() => {
                  setOpenModal(claim.id);
                }}>
                  {headerColumns.map((column) => {
                    if (column.uid === "actions") {
                      if (claim.status === "pending") {
                        return <TableCell key={column.uid}>
                          <Button variant="flat" size="sm" color="primary" onClick={() => doneRow(claim.id)}>Done</Button>
                        </TableCell>
                      }
                    }
                    return <TableCell key={column.uid}>{renderCell(claim, column.uid)}</TableCell>
                  })}
                </TableRow>
              );
            })}
          </TableBody> :
          <TableBody emptyContent={"Loading..."} className="flex-1">
            <TableRow>
              {headerColumns.map((column, index) => (
                <TableCell key={column.uid}>{!index ? "Loading..." : ""}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        }
      </Table>
    </>
  );
}
