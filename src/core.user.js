// ==UserScript==
// @name         IDownvotedBecauseUI
// @namespace    https://github.com/TwentyFourMinutes/IDownvotedBecauseUI
// @homepage     https://github.com/TwentyFourMinutes/IDownvotedBecauseUI
// @homepageURL  https://github.com/TwentyFourMinutes/IDownvotedBecauseUI
// @version      v1.2.1
// @description  A StackOverflow user script which adds a simple UI to justify the reason of the downvote.
// @author       Twenty (https://github.com/TwentyFourMinutes, https://stackoverflow.com/users/10070647/twenty)
// @include        https://*stackoverflow.com/questions/*
// @include        https://*stackoverflow.com/review/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let observer = new MutationObserver(function (mutations, me) {
        let btn = document.querySelector(".question .js-vote-down-btn");
        if (btn) {
            Core();
            me.disconnect();
            return;
        }
    });

    observer.observe(document, {
        childList: true,
        subtree: true
    });

    function Core() {
        let downvoteButton = document.querySelector(".question .js-vote-down-btn");
        let postMenu = document.querySelector(".post-menu");

        let menu = document.createElement("div");
        menu.innerHTML = `
    <div class="popup-close"><a title="close this popup (or hit Esc)">×</a></div>
    <form>
        <div>
            <h2 style="margin-bottom:12px;" class="c-move" data-target="se-draggable.handle">
                I am downvoting this question because...
            </h2>
            <ul class="action-list" style="display: flex; justify-content: space-between; flex-wrap: wrap; max-width: 600px">
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted, because [the OP is unresponsive]({0}).' value="https://idownvotedbecau.se/beingunresponsive">
                        <span class="action-name">Being unresponsive...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/beingunresponsive" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted because the [exception(s) are posted as image(s)]({0}).' value="https://idownvotedbecau.se/imageofanexception/">
                        <span class="action-name">Image of an exception...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/imageofanexception/" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted, because the [code is posted as images instead of text]({0}).' value="https://idownvotedbecau.se/imageofcode">
                        <span class="action-name">Images of code...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/imageofcode" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted, because the [question does not contain a full description]({0}), and just stating that "It is not working", is not enough.' value="https://idownvotedbecau.se/itsnotworking/">
                        <span class="action-name">"It's not working"...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/itsnotworking/" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence="I downvoted, because it seems like that the OP didn't [attempted to try solving the problem themselves first]({0})." value="https://idownvotedbecau.se/noattempt/" ">
                        <span class="action-name">No attempt...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/noattempt/" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted, because the [question does not contain any code]({0}).' value="https://idownvotedbecau.se/nocode/">
                        <span class="action-name">No code...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/nocode/" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted, because it seems like that [no or less effort in debugging the code]({0}) was made.' value="https://idownvotedbecau.se/nodebugging/">
                        <span class="action-name">No debugging...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/nodebugging/" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted, because the question [does not contain any exception details]({0}) what so ever.' value="https://idownvotedbecau.se/noexceptiondetails/">
                        <span class="action-name">Missing exception details...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/noexceptiondetails/" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted, because a [minimal, complete and verifiable example]({0}) is missing.' value="https://idownvotedbecau.se/nomcve/">
                        <span class="action-name">No MCVE...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/nomcve/" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted, because it seems like [that no or little effort in researching]({0}) has been done.' value="https://idownvotedbecau.se/noresearch/">
                        <span class="action-name">No research...</span>
                    </label>
                     <a style="margin-left: 23px" href="https://idownvotedbecau.se/noresearch/" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted, because the question contains [too much and potentially unnecessary code]({[}0}).' value="https://idownvotedbecau.se/toomuchcode/">
                        <span class="action-name">Too much code...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/toomuchcode/" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted, because the question contains [too much and potentially unnecessary information]({0}).' value="https://idownvotedbecau.se/toomuchinfo/">
                        <span class="action-name">Too much information...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/toomuchinfo/" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted, because it is [unclear on what you are asking]({0}).' value="https://idownvotedbecau.se/unclearquestion">
                        <span class="action-name">Unclear what you're asking...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/unclearquestion" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted, because [the code is poorly formatted]({0}), which makes it hard to read.' value="https://idownvotedbecau.se/unreadablecode/">
                        <span class="action-name">Unreadable code...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/unreadablecode/" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" data-sentence='I downvoted, because [the post is not written in english]([0}).' value="https://idownvotedbecau.se/wronglanguage">
                        <span class="action-name">Wrong language...</span>
                    </label>
                    <a style="margin-left: 23px" href="https://idownvotedbecau.se/wronglanguage" target="_blank">Learn more</a>
                </li>
                <li class="" style="width: 250px">
                    <label>
                        <input type="radio" class="js-flag-load-close " name="reason" value="no-response" checked>
                        <span class="action-name">No reason...</span>
                    </label>
                </li>
            </ul>
        </div>
        <div class="popup-actions">
            <div style="float:right">
                <input type="button" class="popup-submit" style="float:none; margin-left:5px;" value="Cancel">
                <input type="submit" class="popup-submit" style="float:none; margin-left:5px;" value="Downvote Question">
            </div>
        </div>
    </form>`;
        menu.style.cssText = 'position: absolute; top: calc(50vh - 281px); left: calc(50% - 347px);';
        menu.classList.add("popup");
        menu.classList.add("responsively-horizontally-centered-legacy-popup");
        menu.id = "popup-downvote-post";
        menu.setAttribute("data-controller", "se-draggable");

        downvoteButton.addEventListener("click", () => {

        if (downvoteButton.getAttribute("aria-pressed") == true) {
            return;
        }

            postMenu.appendChild(menu);

            let popUp = document.getElementById("popup-downvote-post");

            setTimeout(() => {
                popUp.style.display = "block";
            }, 10);

            let submitButton = document.querySelector("#popup-downvote-post input[type=submit]");
            let cancelButton = document.querySelector("#popup-downvote-post input[type=button]");
            let popupClose = document.querySelector("#popup-downvote-post .popup-close");
            let radios = document.querySelectorAll('#popup-downvote-post input[type=radio][name="reason"]');
            let addComment = document.querySelector('.js-add-link.comments-link');

            let selected = document.querySelector("#popup-downvote-post input[type=radio][value=no-response]");

            function changeHandler(e) {
                selected = e.currentTarget;
            }

            Array.prototype.forEach.call(radios, function (radio) {
                radio.addEventListener('change', changeHandler);
            });

            submitButton.addEventListener("click", (e) => {
                if (selected.value != "no-response") {
                    if (!commentUpIfCommentExist()) {
                        addComment.click();

                        let commentContainer = document.querySelector('.question .comments textarea');
                        let commentSubmit = document.querySelector('.question .comments button[type=submit].s-btn,s-btn__primary');

                        commentContainer.innerText = selected.dataset.sentence.toString().format(selected.value);

                        setTimeout(() => {
                            commentSubmit.click();
                        }, 100);
                    }
                }
                e.preventDefault();
                removePopUp();
            });

            function removePopUp() {
                postMenu.removeChild(menu);
                document.removeEventListener("mousedown", onClick);
                document.removeEventListener("keydown", keyDown);
            }

            cancelButton.onclick = () => {
                downvoteButton.click();
                removePopUp();
            };
            popupClose.onclick = removePopUp;

            function onClick(e) {
                let bounding = popUp.getBoundingClientRect();

                if (bounding.left > e.x || bounding.left + bounding.width < e.x || bounding.top > e.y || bounding.top + bounding.height < e.y) {
                    removePopUp();
                }
            }

            document.addEventListener("mousedown", onClick);

            function keyDown(e) {
                if (e.key == "Escape") {
                    removePopUp();
                }
            }

            document.addEventListener("keydown", keyDown);
        });

        function commentUpIfCommentExist(url) {
            let comments = document.querySelectorAll('.question .comments .comment');

            comments.forEach(elem => {
                if (elem.innerHTML.includes(url)) {
                    let upVoteButton = elem.querySelector("a.comment-up");
                    upVoteButton.click();
                    return true;
                }
            });

            return false;
        }

        String.prototype.format = function () {
            let args = arguments;
            return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
                if (m == "{{") {
                    return "{";
                }
                if (m == "}}") {
                    return "}";
                }
                return args[n];
            });
        };
    }
})();