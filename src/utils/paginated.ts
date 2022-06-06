type Info = {
  totalItems: number
  pages: number
  currentPage: number
  itemsPerPage: number
}

export type Paginated<T> = {
  info: Info
  data: T[]
}
