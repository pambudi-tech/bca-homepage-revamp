"use client";
import { createContext } from "react";
export const CatalogSpecsContext = createContext(false);

export const CatalogBrandContext = createContext<"prioritas" | "solitaire">("prioritas");

export const CatalogBlueprintContext = createContext(false);

export const CatalogFieldToneContext = createContext<"default" | "prioritas" | "solitaire">("default");

export const CatalogEdgeCaseContext = createContext(false);
export const edgeCaseComponents = new Set(["dropdown", "content-card", "privilege-card", "banking-privilege-card", "wealth-insight-card", "privilege-feature", "hero", "featured-event"]);

export const CatalogFeaturedKindContext = createContext<"default" | "ads">("default");
