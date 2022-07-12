"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let faveStoryList;
let faveStoryIds

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  faveStoryList = await StoryList.getFaveStories();

  faveStoryIds = faveStoryList.stories.map(story => story.storyId);

  $storiesLoadingMsg.remove();

  putStoriesOnPage(storyList);
}

async function showFaveStories() {
  faveStoryList = await StoryList.getFaveStories()

  putStoriesOnPage(faveStoryList);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(list) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of list.stories) {
    const $story = generateStoryMarkup(story);
    if (faveStoryIds.includes(story.storyId)) {
      $story.prepend("<span class='icon favorite'>&#9733;</span>")
    }
    else $story.prepend("<span class='icon unfavorite'>&#9734;</span>");
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

//listen for favorite/unfavorite classes and calls relevant function

$allStoriesList.on("click", ".unfavorite", function () {
  addFavorite(currentUser, this.closest("li").id);
  getAndShowStoriesOnStart();
});

$allStoriesList.on("click", ".favorite", function () {
  deleteFavorite(currentUser, this.closest("li").id);
  getAndShowStoriesOnStart();
});

//submits a story based on values from story form
async function submitStory(evt) {
  evt.preventDefault();

  const author = $("#story-author").val();
  const title = $("#story-title").val();
  const url = $("#story-url").val();

  await storyList.addStory(currentUser, { title: title, author: author, url: url });

  hidePageComponents();
  getAndShowStoriesOnStart();
}

$storyForm.on("submit", submitStory);