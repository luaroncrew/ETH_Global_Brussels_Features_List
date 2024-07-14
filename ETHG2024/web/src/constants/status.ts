import { Status } from "@prisma/client";

export const STATUS_LABEL: { [key in Status]: string } = {
  [Status.DRAFT]: "Draft",
  [Status.DISCUSSED]: "Discussed",
  [Status.NEXT_UP]: "Next Up",
  [Status.IN_PROGRESS]: "In Progress",
  [Status.DONE]: "Done",
  [Status.ARCHIVED]: "Archived",
};

export const STATUS_IN_ROADMAP = [
  Status.NEXT_UP,
  Status.IN_PROGRESS,
  Status.DONE,
];
