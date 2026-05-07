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

export function categoryDocToDTO(doc: any): CategoryDTO {
  return {
    _id: doc._id ? doc._id.toString() : "",
    name: doc.name || "Unknown",
    sortOrder: doc.sortOrder ?? 0,
    image: doc.image ?? "",
    parentId: doc.parentId ? doc.parentId.toString() : undefined,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : 
               (typeof doc.createdAt === 'string' ? doc.createdAt : undefined),
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : 
               (typeof doc.updatedAt === 'string' ? doc.updatedAt : undefined),
  };
}
