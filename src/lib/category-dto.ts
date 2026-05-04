import type { CategoryDTO } from "@/types";

type CategoryLean = {
  _id: { toString: () => string };
  name: string;
  sortOrder?: number;
  image?: string;
  parentId?: { toString: () => string } | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export function categoryDocToDTO(doc: CategoryLean): CategoryDTO {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    sortOrder: doc.sortOrder ?? 0,
    image: doc.image ?? "",
    parentId: doc.parentId ? doc.parentId.toString() : undefined,
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
}
