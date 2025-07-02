
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink,
  PaginationNext,
  PaginationPrevious 
} from '@/components/ui/pagination';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';

interface Column<T> {
  id: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  filterType?: 'text' | 'select' | 'number' | 'date' | 'boolean';
  filterOptions?: {label: string, value: string}[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: string;
}

export const DataTable = <T extends { id: string | number }>({
  data,
  columns,
  searchKey = '',
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map(column => column.id)
  );
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (searchKey && searchQuery) {
        const value = item[searchKey]?.toString().toLowerCase() || '';
        if (!value.includes(searchQuery.toLowerCase())) {
          return false;
        }
      }

      for (const columnId in filters) {
        if (filters[columnId]) {
          const value = item[columnId]?.toString().toLowerCase() || '';
          const filterValue = filters[columnId].toLowerCase();
          
          if (!value.includes(filterValue)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchKey, searchQuery, filters]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleFilterChange = (columnId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
    setCurrentPage(1);
  };

  const clearFilter = (columnId: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnId];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery;

  const renderPaginationLinks = () => {
    let items = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          isActive={currentPage === 1}
          onClick={() => setCurrentPage(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Calculate range of visible pages
    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
    
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            isActive={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`Search by ${searchKey}...`}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setIsFilterSheetOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {Object.keys(filters).length + (searchQuery ? 1 : 0)}
              </span>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Filter className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns.includes(column.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setVisibleColumns([...visibleColumns, column.id]);
                    } else {
                      setVisibleColumns(visibleColumns.filter((id) => id !== column.id));
                    }
                  }}
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns
                .filter((column) => visibleColumns.includes(column.id))
                .map((column) => (
                  <TableHead key={column.id} className="font-bold text-black">{column.header}</TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <TableRow key={item.id}>
                  {columns
                    .filter((column) => visibleColumns.includes(column.id))
                    .map((column) => (
                      <TableCell key={`${item.id}-${column.id}`}>
                        {column.cell(item)}
                      </TableCell>
                    ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </p>
          
          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage((prev) => prev - 1);
                  }
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
              {renderPaginationLinks()}
              <PaginationNext
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage((prev) => prev + 1);
                  }
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Apply filters to narrow down results</SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            {columns
              .filter(column => column.filterType)
              .map(column => (
                <div key={column.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium" htmlFor={`filter-${column.id}`}>
                      {column.header}
                    </label>
                    {filters[column.id] && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => clearFilter(column.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Clear</span>
                      </Button>
                    )}
                  </div>
                  {column.filterType === 'select' && column.filterOptions ? (
                    <Select 
                      value={filters[column.id] || ''} 
                      onValueChange={(value) => handleFilterChange(column.id, value)}
                    >
                      <SelectTrigger id={`filter-${column.id}`} className="h-9">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {column.filterOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`filter-${column.id}`}
                      value={filters[column.id] || ''}
                      onChange={(e) => handleFilterChange(column.id, e.target.value)}
                      className="h-9"
                      placeholder={`Filter by ${column.header.toLowerCase()}...`}
                    />
                  )}
                </div>
              ))}

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters} 
                className="w-full mt-2"
              >
                Clear all filters
              </Button>
            )}
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button className="w-full">Apply Filters</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DataTable;

