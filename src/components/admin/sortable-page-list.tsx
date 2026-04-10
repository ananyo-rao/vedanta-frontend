"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  PlayCircle,
  BookOpen,
  Wind,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminPageEditor } from "@/components/admin/admin-page-editor";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { CoursePage, PageType, VideoContent, IntrospectionContent, MeditationContent } from "@/types/course";

interface SortablePageListProps {
  pages: CoursePage[];
  onReorder: (pageIds: string[]) => Promise<void>;
  onUpdatePage: (
    pageId: string,
    data: {
      title: string;
      page_type: PageType;
      is_strict: boolean;
      content: VideoContent | IntrospectionContent | MeditationContent;
    }
  ) => Promise<void>;
  onDeletePage: (pageId: string) => Promise<void>;
  savingPageId: string | null;
}

const PAGE_TYPE_ICONS: Record<PageType, React.ReactNode> = {
  video: <PlayCircle className="h-4 w-4 text-primary" />,
  introspection: <BookOpen className="h-4 w-4 text-primary" />,
  meditation: <Wind className="h-4 w-4 text-primary" />,
};

const PAGE_TYPE_LABELS: Record<PageType, string> = {
  video: "Video",
  introspection: "Introspection",
  meditation: "Meditation",
};

export function SortablePageList({
  pages,
  onReorder,
  onUpdatePage,
  onDeletePage,
  savingPageId,
}: SortablePageListProps) {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [deletePageId, setDeletePageId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newPages = [...pages];
    const [moved] = newPages.splice(oldIndex, 1);
    newPages.splice(newIndex, 0, moved);

    try {
      await onReorder(newPages.map((p) => p.id));
      toast.success("Order saved");
    } catch {
      toast.error("Failed to reorder pages");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newPages = [...pages];
    [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    try {
      await onReorder(newPages.map((p) => p.id));
      toast.success("Order saved");
    } catch {
      toast.error("Failed to reorder pages");
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === pages.length - 1) return;
    const newPages = [...pages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    try {
      await onReorder(newPages.map((p) => p.id));
      toast.success("Order saved");
    } catch {
      toast.error("Failed to reorder pages");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletePageId) return;
    try {
      await onDeletePage(deletePageId);
      toast.success("Page deleted");
    } catch {
      toast.error("Failed to delete page");
    } finally {
      setDeletePageId(null);
    }
  };

  if (pages.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-outline-variant/30 p-8 text-center">
        <p className="text-sm text-on-surface-variant">
          No pages added yet. Click + Add Page to begin building your course.
        </p>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pages.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {pages.map((page, index) => (
              <SortablePageCard
                key={page.id}
                page={page}
                index={index}
                isEditing={editingPageId === page.id}
                onEdit={() => setEditingPageId(page.id)}
                onCancelEdit={() => setEditingPageId(null)}
                onSave={async (data) => {
                  await onUpdatePage(page.id, data);
                  setEditingPageId(null);
                }}
                onDelete={() => setDeletePageId(page.id)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                isFirst={index === 0}
                isLast={index === pages.length - 1}
                saving={savingPageId === page.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <ConfirmDialog
        open={!!deletePageId}
        onOpenChange={() => setDeletePageId(null)}
        title="Delete this page?"
        description="This action cannot be undone. The page and its content will be permanently removed."
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

interface SortablePageCardProps {
  page: CoursePage;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (data: {
    title: string;
    page_type: PageType;
    is_strict: boolean;
    content: VideoContent | IntrospectionContent | MeditationContent;
  }) => Promise<void>;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  saving: boolean;
}

function SortablePageCard({
  page,
  index,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  saving,
}: SortablePageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style}>
        <AdminPageEditor
          page={page}
          pageType={page.page_type}
          onSave={onSave}
          onCancel={onCancelEdit}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg bg-surface-container-low p-3 transition-colors hover:bg-surface-container-high"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-on-surface-variant hover:text-on-surface"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <span className="w-6 text-center text-xs font-medium text-on-surface-variant">
        {index + 1}
      </span>

      <span className="flex-shrink-0" aria-label={`${PAGE_TYPE_LABELS[page.page_type]} page`}>
        {PAGE_TYPE_ICONS[page.page_type]}
      </span>

      <button
        type="button"
        className="min-w-0 flex-1 text-left text-sm font-medium text-on-surface hover:text-primary"
        onClick={onEdit}
        aria-label={`Edit page: ${page.title}`}
      >
        <span className="truncate">{page.title}</span>
      </button>

      <Badge variant="outline" className="flex-shrink-0 text-[10px]">
        {page.is_strict ? "Strict" : "Optional"}
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            aria-label={`Actions for ${page.title}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          {!isFirst && (
            <DropdownMenuItem onClick={onMoveUp}>
              <ChevronUp className="mr-2 h-4 w-4" />
              Move Up
            </DropdownMenuItem>
          )}
          {!isLast && (
            <DropdownMenuItem onClick={onMoveDown}>
              <ChevronDown className="mr-2 h-4 w-4" />
              Move Down
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
