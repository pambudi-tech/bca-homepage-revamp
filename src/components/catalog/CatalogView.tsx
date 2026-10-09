"use client";
import { createContext } from "react";
export const CatalogSpecsContext = createContext(false);

export const CatalogBrandContext = createContext<"prioritas" | "solitaire">("prioritas");
