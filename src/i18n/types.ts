/**
 * A display statement split into segments. `br` says where a fixed line
 * break follows the segment: on every viewport, or on mobile only.
 */
export interface Segment {
  t: string;
  br?: 'all' | 'mobile';
}

export interface ProjectCopy {
  title: string[];
  meta: string[];
  body: string;
  alt: string;
}

export interface Copy {
  metaTitle: string;
  metaDescription: string;
  skip: string;
  nav: {
    label: string;
    projects: string;
    studio: string;
    services: string;
    contact: string;
    menu: string;
    close: string;
    language: string;
  };
  ids: { approach: string; projects: string; studio: string; services: string; contact: string };
  hero: { title: string[]; meta: string[]; scroll: string };
  approach: {
    label: string;
    statement: Segment[];
    body: string;
    secondary: string;
    meta: string[];
  };
  projects: {
    label: string;
    hausAmHang: ProjectCopy;
    hof08: ProjectCopy;
    casaLinea: ProjectCopy;
  };
  studio: {
    label: string;
    title: string[];
    body: string;
    facts: { term: string; items: string[] }[];
  };
  services: {
    label: string;
    rows: { title: string; detail: string }[];
    support: string;
  };
  forma: { meta: string; title: string[]; body: string; cta: string };
  footer: { title: string; disclaimer: string; credit: string; imagery: string; copyright: string };
}
