/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { ArrowUpDown, ChevronDown, Loader2 } from "lucide-react"
import domo from "ryuu.js";
import { successToast } from 'components/Toaster/Toaster';
import { Popover, PopoverContent, PopoverTrigger } from 'components/ui/popover';
import { MdOutlineWhatsapp } from "react-icons/md";
import { IoMdMail } from "react-icons/io";
import { RiMessage2Line } from "react-icons/ri";

const TableList = ({ data }) => {
  //console.log("data", data);
  const columns = [
    {
      accessorKey: "Customer Name",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Customer Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("Customer Name")}</div>
      ),
    },
    {
      accessorKey: "Event Type",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Event Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => {
        const eventType = row.getValue("Event Type");
        const textColor = eventType === "Birthday" ? "text-pink-500" : eventType === "Anniversary" ? "text-green-500" : "text-gray-500";
    
        return <div className={`capitalize ${textColor}`}>{eventType}</div>;
      },
    },
    {
      accessorKey: "Event Date",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Event Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => <div className="capitalize">{row.getValue("Event Date")}</div>,
    },
    {
      accessorKey: "Days Left ",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Days Left
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("Days Left ")}</div>,
    },
    {
      accessorKey: "Notify",
      header: ({ column }) => {
        return (
          <div
            className='flex items-center cursor-pointer'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Action
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        )
      },
      cell: ({ row }) => {
        const [singleEmailLoading, setSingleEmailLoading] = useState(false);
        const [singleEmailOpen, setSingleEmailOpen] = useState(false);
        
        const eventDate = new Date(row.getValue("Event Date"));
        const eventType = row.getValue("Event Type");
        const customerName = row.getValue("Customer Name");

        const handleEmailSent = (email) => {
          setSingleEmailLoading(true);

          const getEmailContent = (type, name) => {
            if (type === "Birthday") {
              return {
                subject: "🎉 A Special Birthday Gift Just for You! 🎁",
                body: `Dear ${name},

We hope this message finds you well and filled with joy as you celebrate your special day!🎈

Wishing you a very happy Birthday! 🎂

To make your birthday even more memorable, we're excited to offer you an exclusive 2.75% discount on any gold purchase with us! It's our way of saying "thank you" for being such a valued customer.

We look forward to serving you again and wish you nothing but happiness and success in the year ahead!

Warmest wishes,
Coimbatore Jewellers`
              };
            } else if (type === "Anniversary") {
              return {
                subject: "🎉 A Special Anniversary Gift Just for You! 🎁",
                body: `Dear ${name},

We hope this message finds you well and filled with joy as you celebrate your special day!🎈

Wishing you a very happy Anniversary! 🎂

To make your anniversary even more memorable, we're excited to offer you an exclusive 2.5% discount on any gold purchase with us! It's our way of saying "thank you" for being such a valued customer.

We look forward to serving you again and wish you nothing but happiness and success in the year ahead!

Warmest wishes,
Coimbatore Jewellers`
              };
            }
            return {
              subject: "Exclusive Festive Offer Just for You!",
              body: `<p>Thank you for being a valued customer. We look forward to helping you find the perfect piece to celebrate the season.</p>`
            };
          };

          const emailContent = getEmailContent(eventType, customerName);

          const htmlBody = emailContent.body.split('\n').map(line => 
            line ? `<p style="margin: 0 0 0.5em 0;">${line}</p>` : '<br>'
          ).join('');

          const data = {
            to: domo.env.userEmail,
            subject: emailContent.subject,
            body: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${htmlBody}</div>`
          };
  
          domo.post(`/domo/workflow/v1/models/eig_mail/start`, data)
            .then((response) => {
              setSingleEmailLoading(false);
              if (response) {
                successToast("Email sent to customer");
                setSingleEmailOpen(false);
              }
            })
            .catch((error) => {
              setSingleEmailLoading(false);
              console.error("Error starting workflow:", error);
            });
        };
  
        return(
          <Popover open={singleEmailOpen} onOpenChange={setSingleEmailOpen}>
            <PopoverTrigger asChild>
              <div
                className="bg-green-500 py-1 px-2 w-20 rounded uppercase text-center text-white text-[12px] font-medium cursor-pointer"
                onClick={() => setSingleEmailOpen(true)} disabled={eventDate.toDateString() !== new Date().toDateString()}
              >
                Notify
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-fit">
              <div className="flex gap-4 items-center">
                {singleEmailLoading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <IoMdMail
                    onClick={() => handleEmailSent("aarthi.murugesan@gwcdata.ai")}
                    className="text-2xl text-[#015289] hover:text-blue-500"
                  />
                )}
                <MdOutlineWhatsapp className="text-2xl text-[#015289] hover:text-green-500" />
                <RiMessage2Line className="text-2xl text-[#015289] hover:text-red-500" />
              </div>
            </PopoverContent>
          </Popover>
        );
      },
      
    },
  ]



  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [rowSelection, setRowSelection] = React.useState({})

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 5, // Limit rows per page to 10
  });
 
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
  })

  const totalPages = table.getPageCount();

  return (
    <div className="w-full">
      
      <div className="flex justify-between md:items-center py-4 md:flex-row flex-col">
        <div className='flex items-center'>
          <Input
            placeholder="Search..."
            value={table.getState().globalFilter ?? ""}
            onChange={(event) =>
              table.setGlobalFilter(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-black">
          <div>
              Record count : {" "}
              <span className="font-bold">{table.getFilteredRowModel().rows.length}</span>
            </div>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TableList;