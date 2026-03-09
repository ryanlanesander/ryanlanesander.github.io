const blogEntries = document.getElementById("blogEntries");
const blogTags = document.getElementById("blogTags");
const blogStatus = document.getElementById("blogStatus");

const state = {
  posts: [],
  activeTag: "all"
};

const tagLabel = (tag) => tag.replace(/-/g, " ");

const setStatus = (message, isVisible = true) => {
  blogStatus.textContent = message;
  blogStatus.style.display = isVisible ? "block" : "none";
};

const renderTags = () => {
  const tagSet = new Set();
  state.posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)));
  const tags = ["all", ...Array.from(tagSet).sort()];

  blogTags.innerHTML = "";
  tags.forEach((tag) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `blog-tag${state.activeTag === tag ? " is-active" : ""}`;
    button.textContent = tag === "all" ? "All" : tagLabel(tag);
    button.addEventListener("click", () => {
      state.activeTag = tag;
      renderTags();
      renderPosts();
    });
    blogTags.appendChild(button);
  });
};

const renderPosts = () => {
  const filtered = state.activeTag === "all"
    ? state.posts
    : state.posts.filter((post) => post.tags.includes(state.activeTag));

  blogEntries.innerHTML = "";

  if (!filtered.length) {
    setStatus("No posts for this tag.");
    return;
  }

  setStatus("", false);

  filtered.forEach((post) => {
    const entry = document.createElement("article");
    entry.className = "blog-entry";

    const tagPills = post.tags
      .map((tag) => `<span class=\"tag-pill\">${tagLabel(tag)}</span>`)
      .join("");

    entry.innerHTML = `
      <h3>${post.title}</h3>
      <div class=\"blog-meta\">
        <span>${post.date}</span>
        <span class=\"tag-list\">${tagPills}</span>
      </div>
      <div class=\"blog-body\">${post.html}</div>
    `;

    blogEntries.appendChild(entry);
  });
};

const loadPosts = async () => {
  try {
    setStatus("Loading posts...");
    const response = await fetch("blog/posts.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load posts.json");
    }
    const data = await response.json();

    const posts = await Promise.all(
      data.map(async (post) => {
        const markdownResponse = await fetch(post.file, { cache: "no-store" });
        if (!markdownResponse.ok) {
          throw new Error(`Unable to load ${post.file}`);
        }
        const markdown = await markdownResponse.text();
        return {
          ...post,
          html: window.marked.parse(markdown)
        };
      })
    );

    state.posts = posts;
    renderTags();
    renderPosts();
  } catch (error) {
    console.error(error);
    setStatus("Unable to load blog entries. Check your posts.json paths.");
  }
};

if (blogEntries && blogTags && blogStatus) {
  loadPosts();
}
