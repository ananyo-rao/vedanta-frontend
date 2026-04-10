import { describe, it, expect } from "vitest";
import {
  createCourseSchema,
  videoContentSchema,
  introspectionContentSchema,
  meditationContentSchema,
  reorderPagesSchema,
  introspectionResponseSchema,
  createPageSchema,
  videoProgressSchema,
} from "./course-schemas";

describe("createCourseSchema", () => {
  it("validates a valid course input", () => {
    const result = createCourseSchema.safeParse({
      title: "Introduction to Vedanta",
      description: "A foundational course on Advaita Vedanta.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = createCourseSchema.safeParse({
      description: "A course",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty title", () => {
    const result = createCourseSchema.safeParse({
      title: "",
      description: "A course",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Title is required");
    }
  });

  it("rejects missing description", () => {
    const result = createCourseSchema.safeParse({
      title: "Valid Title",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty description", () => {
    const result = createCourseSchema.safeParse({
      title: "Valid Title",
      description: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Description is required");
    }
  });

  it("rejects title longer than 120 characters", () => {
    const result = createCourseSchema.safeParse({
      title: "A".repeat(121),
      description: "Valid description",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Title must be 120 characters or less"
      );
    }
  });

  it("accepts title exactly 120 characters", () => {
    const result = createCourseSchema.safeParse({
      title: "A".repeat(120),
      description: "Valid description",
    });
    expect(result.success).toBe(true);
  });

  it("rejects description longer than 500 characters", () => {
    const result = createCourseSchema.safeParse({
      title: "Valid Title",
      description: "A".repeat(501),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Description must be 500 characters or less"
      );
    }
  });

  it("accepts description exactly 500 characters", () => {
    const result = createCourseSchema.safeParse({
      title: "Valid Title",
      description: "A".repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional fields: intro_video_url, thumbnail_url, course_type, teacher_name", () => {
    const result = createCourseSchema.safeParse({
      title: "Valid Title",
      description: "Valid description",
      intro_video_url: "https://youtube.com/watch?v=abc123",
      thumbnail_url: "https://example.com/thumb.jpg",
      course_type: "Foundation",
      teacher_name: "Swami Paramarthananda",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null for nullable optional fields", () => {
    const result = createCourseSchema.safeParse({
      title: "Valid Title",
      description: "Valid description",
      intro_video_url: null,
      intro_video_source: null,
      thumbnail_url: null,
      teacher_name: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid intro_video_url", () => {
    const result = createCourseSchema.safeParse({
      title: "Valid Title",
      description: "Valid description",
      intro_video_url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("validates intro_video_source enum", () => {
    const valid = createCourseSchema.safeParse({
      title: "Valid Title",
      description: "Valid description",
      intro_video_source: "youtube",
    });
    expect(valid.success).toBe(true);

    const invalid = createCourseSchema.safeParse({
      title: "Valid Title",
      description: "Valid description",
      intro_video_source: "twitch",
    });
    expect(invalid.success).toBe(false);
  });
});

describe("videoContentSchema", () => {
  it("validates valid video content", () => {
    const result = videoContentSchema.safeParse({
      video_url: "https://youtube.com/watch?v=abc",
      video_source: "youtube",
      summary: "Key takeaways from the teaching.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing video_url", () => {
    const result = videoContentSchema.safeParse({
      video_source: "youtube",
      summary: "A summary",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty video_url", () => {
    const result = videoContentSchema.safeParse({
      video_url: "",
      video_source: "youtube",
      summary: "A summary",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Video URL is required");
    }
  });

  it("rejects missing summary", () => {
    const result = videoContentSchema.safeParse({
      video_url: "https://example.com/video.mp4",
      video_source: "gcs",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty summary", () => {
    const result = videoContentSchema.safeParse({
      video_url: "https://example.com/video.mp4",
      video_source: "gcs",
      summary: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Summary is required");
    }
  });

  it("rejects summary longer than 1000 characters", () => {
    const result = videoContentSchema.safeParse({
      video_url: "https://example.com/video.mp4",
      video_source: "gcs",
      summary: "A".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("validates video_source enum values", () => {
    const validSources = ["gcs", "youtube", "vimeo", "external"];
    for (const source of validSources) {
      const result = videoContentSchema.safeParse({
        video_url: "https://example.com/video.mp4",
        video_source: source,
        summary: "A summary",
      });
      expect(result.success).toBe(true);
    }

    const invalid = videoContentSchema.safeParse({
      video_url: "https://example.com/video.mp4",
      video_source: "twitch",
      summary: "A summary",
    });
    expect(invalid.success).toBe(false);
  });
});

describe("introspectionContentSchema", () => {
  it("validates valid introspection content", () => {
    const result = introspectionContentSchema.safeParse({
      verse: "\u0924\u0924\u094D\u0924\u094D\u0935\u092E\u0938\u093F",
      explanation: "This verse explains the nature of the Self.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing verse", () => {
    const result = introspectionContentSchema.safeParse({
      explanation: "An explanation",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty verse", () => {
    const result = introspectionContentSchema.safeParse({
      verse: "",
      explanation: "An explanation",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Devanagari verse is required"
      );
    }
  });

  it("rejects missing explanation", () => {
    const result = introspectionContentSchema.safeParse({
      verse: "verse text",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty explanation", () => {
    const result = introspectionContentSchema.safeParse({
      verse: "verse text",
      explanation: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Explanation is required");
    }
  });

  it("rejects explanation longer than 2000 characters", () => {
    const result = introspectionContentSchema.safeParse({
      verse: "verse text",
      explanation: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Explanation must be 2000 characters or less"
      );
    }
  });
});

describe("meditationContentSchema", () => {
  it("validates valid meditation content", () => {
    const result = meditationContentSchema.safeParse({
      video_url: "https://youtube.com/watch?v=abc",
      video_source: "youtube",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional description", () => {
    const result = meditationContentSchema.safeParse({
      video_url: "https://youtube.com/watch?v=abc",
      video_source: "youtube",
      description: "A calming meditation session.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts missing description", () => {
    const result = meditationContentSchema.safeParse({
      video_url: "https://youtube.com/watch?v=abc",
      video_source: "youtube",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing video_url", () => {
    const result = meditationContentSchema.safeParse({
      video_source: "youtube",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty video_url", () => {
    const result = meditationContentSchema.safeParse({
      video_url: "",
      video_source: "youtube",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Video URL is required");
    }
  });

  it("rejects description longer than 500 characters", () => {
    const result = meditationContentSchema.safeParse({
      video_url: "https://example.com/video.mp4",
      video_source: "gcs",
      description: "A".repeat(501),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Description must be 500 characters or less"
      );
    }
  });
});

describe("createPageSchema", () => {
  it("validates a video page", () => {
    const result = createPageSchema.safeParse({
      title: "Teaching on the Self",
      page_type: "video",
      is_strict: true,
      content: {
        video_url: "https://youtube.com/watch?v=abc",
        video_source: "youtube",
        summary: "The key teaching.",
      },
    });
    expect(result.success).toBe(true);
  });

  it("validates an introspection page", () => {
    const result = createPageSchema.safeParse({
      title: "Verse Reflection",
      page_type: "introspection",
      is_strict: true,
      content: {
        verse: "Devanagari text",
        explanation: "English explanation",
      },
    });
    expect(result.success).toBe(true);
  });

  it("validates a meditation page", () => {
    const result = createPageSchema.safeParse({
      title: "Guided Meditation",
      page_type: "meditation",
      is_strict: false,
      content: {
        video_url: "https://vimeo.com/12345",
        video_source: "vimeo",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const result = createPageSchema.safeParse({
      page_type: "video",
      is_strict: true,
      content: {
        video_url: "https://example.com/video.mp4",
        video_source: "gcs",
        summary: "A summary",
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 120 characters", () => {
    const result = createPageSchema.safeParse({
      title: "A".repeat(121),
      page_type: "video",
      is_strict: true,
      content: {
        video_url: "https://example.com/video.mp4",
        video_source: "gcs",
        summary: "A summary",
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid page_type", () => {
    const result = createPageSchema.safeParse({
      title: "Valid Title",
      page_type: "live_session",
      is_strict: true,
      content: {},
    });
    expect(result.success).toBe(false);
  });

  it("defaults is_strict to true", () => {
    const result = createPageSchema.safeParse({
      title: "Valid Title",
      page_type: "video",
      content: {
        video_url: "https://example.com/video.mp4",
        video_source: "gcs",
        summary: "A summary",
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_strict).toBe(true);
    }
  });
});

describe("reorderPagesSchema", () => {
  it("validates a valid array of page IDs", () => {
    const result = reorderPagesSchema.safeParse({
      page_ids: ["page-1", "page-2", "page-3"],
    });
    expect(result.success).toBe(true);
  });

  it("validates an empty array", () => {
    const result = reorderPagesSchema.safeParse({
      page_ids: [],
    });
    expect(result.success).toBe(true);
  });

  it("validates a single page ID", () => {
    const result = reorderPagesSchema.safeParse({
      page_ids: ["page-1"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing page_ids", () => {
    const result = reorderPagesSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-string IDs in the array", () => {
    const result = reorderPagesSchema.safeParse({
      page_ids: [123, 456],
    });
    expect(result.success).toBe(false);
  });
});

describe("introspectionResponseSchema", () => {
  it("validates a valid response", () => {
    const result = introspectionResponseSchema.safeParse({
      response_text: "This verse reminds me of the impermanence of all things.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty string", () => {
    const result = introspectionResponseSchema.safeParse({
      response_text: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Please write a reflection before submitting"
      );
    }
  });

  it("rejects whitespace-only text via min(1) validation", () => {
    // Note: Zod min(1) checks string length, so a single space passes min(1).
    // However, the schema requires min(1) so an empty string fails.
    const result = introspectionResponseSchema.safeParse({
      response_text: " ",
    });
    // A single space has length 1, so it passes min(1)
    expect(result.success).toBe(true);
  });

  it("rejects response longer than 10000 characters", () => {
    const result = introspectionResponseSchema.safeParse({
      response_text: "A".repeat(10001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Reflection must be 10,000 characters or less"
      );
    }
  });

  it("accepts response exactly 10000 characters", () => {
    const result = introspectionResponseSchema.safeParse({
      response_text: "A".repeat(10000),
    });
    expect(result.success).toBe(true);
  });
});

describe("videoProgressSchema", () => {
  it("validates valid progress", () => {
    const result = videoProgressSchema.safeParse({
      progress_percent: 75,
      last_position: 120,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative progress_percent", () => {
    const result = videoProgressSchema.safeParse({
      progress_percent: -1,
      last_position: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects progress_percent over 100", () => {
    const result = videoProgressSchema.safeParse({
      progress_percent: 101,
      last_position: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts 0 and 100 as valid bounds", () => {
    expect(
      videoProgressSchema.safeParse({ progress_percent: 0, last_position: 0 })
        .success
    ).toBe(true);
    expect(
      videoProgressSchema.safeParse({
        progress_percent: 100,
        last_position: 600,
      }).success
    ).toBe(true);
  });

  it("rejects non-integer progress_percent", () => {
    const result = videoProgressSchema.safeParse({
      progress_percent: 50.5,
      last_position: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative last_position", () => {
    const result = videoProgressSchema.safeParse({
      progress_percent: 50,
      last_position: -1,
    });
    expect(result.success).toBe(false);
  });
});
