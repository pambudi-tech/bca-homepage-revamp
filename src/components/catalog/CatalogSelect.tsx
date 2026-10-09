"use client";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
export default function CatalogSelect({label,value,onChange,options,className=""}:{label:string;value:string;onChange:(value:string)=>void;options:{value:string;label:string}[];className?:string}) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className={`min-w-32 bg-white ${className}`}><SelectValue /></SelectTrigger><SelectContent position="popper">{options.map(option=><SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>;
}
