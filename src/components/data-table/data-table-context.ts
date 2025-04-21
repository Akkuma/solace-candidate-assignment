"use client";

import type { Table } from "@tanstack/react-table";
import { createContext, useContext } from "react";

export const DataTableContext = createContext<{ table: Table<any> | undefined }>({ table: undefined });
export const useDataTable = <T = any>(): Table<T> => {
  const { table } = useContext(DataTableContext);
  if (!table)
    throw new Error(
      "DataTableContext has not been setup. Please ensure your DataTable components live inside a DataTableRoot or manually create the Provider",
    );

  return table as Table<T>;
};
