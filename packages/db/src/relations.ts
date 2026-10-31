import { defineRelations } from "drizzle-orm";
import { discussionRefs, discussions } from "./schema.js";

export const relations = defineRelations(
  { discussions, discussionRefs },
  (r) => ({
    discussionRefs: {
      discussion: r.one.discussions({
        from: r.discussionRefs.discussionId,
        to: r.discussions.id,
      }),
    },
    discussions: {
      refs: r.many.discussionRefs(),
    },
  }),
);
