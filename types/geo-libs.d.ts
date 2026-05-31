declare module "d3-geo" {
  export function geoMercator(): any;
  export function geoPath(projection?: any): any;
  export function geoGraticule(): any;
}

declare module "topojson-client" {
  export function feature(topology: any, object: any): any;
}
