// ==UserScript==
// @name         IDownvotedBecauseUI
// @namespace    https://github.com/TwentyFourMinutes/IDownvotedBecauseUI
// @homepage     https://github.com/TwentyFourMinutes/IDownvotedBecauseUI
// @homepageURL  https://github.com/TwentyFourMinutes/IDownvotedBecauseUI
// @version      v2.0.1
// @description  A StackOverflow user script which adds a simple UI to justify the reason of the downvote.
// @author       Twenty (https://github.com/TwentyFourMinutes, https://stackoverflow.com/users/10070647/twenty)
// @include      https://*stackoverflow.com/questions/*
// @include      https://*stackoverflow.com/review/*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
    //#region Declarations
    var FlagType;
    (function (FlagType) {
        FlagType[FlagType["Question"] = 1] = "Question";
        FlagType[FlagType["Answer"] = 2] = "Answer";
        FlagType[FlagType["All"] = 3] = "All";
    })(FlagType || (FlagType = {}));
    var downvoteReasons = [
        {
            name: "Being unresponsive...",
            reason: "I downvoted, because [the OP is unresponsive]({0}).",
            url: "https://idownvotedbecau.se/beingunresponsive",
            flagType: FlagType.Question
        }, {
            name: "Image of an exception...",
            reason: "I downvoted, because the [exception(s) are posted as image(s)]({0}).",
            url: "https://idownvotedbecau.se/imageofanexception",
            flagType: FlagType.Question
        }, {
            name: "Images of code...",
            reason: "I downvoted, because the [code is posted as images instead of text]({0}).",
            url: "https://idownvotedbecau.se/imageofcode",
            flagType: FlagType.Question
        }, {
            name: "\"It's not working\"...",
            reason: "I downvoted, because the [question does not contain a full description]({0}). Also just stating that \"It is not working\", is not enough.",
            url: "https://idownvotedbecau.se/itsnotworking/",
            flagType: FlagType.Question
        }, {
            name: "No attempt...",
            reason: "I downvoted, because it seems like that no [attempt solving the problem]({0}) was made.",
            url: "https://idownvotedbecau.se/noattempt/",
            flagType: FlagType.Question
        }, {
            name: "No code...",
            reason: "I downvoted, because the [question does not contain any code]({0}).",
            url: "https://idownvotedbecau.se/nocode",
            flagType: FlagType.Question
        }, {
            name: "No debugging...",
            reason: "I downvoted, because it seems like that [no or less effort in debugging the code]({0}) was made.",
            url: "https://idownvotedbecau.se/nodebugging",
            flagType: FlagType.Question
        }, {
            name: "Missing exception details...",
            reason: "I downvoted, because the question [does not contain any exception details]({0}) what so ever.",
            url: "https://idownvotedbecau.se/noexceptiondetails",
            flagType: FlagType.Question
        }, {
            name: "No MCVE...",
            reason: "I downvoted, because a [minimal, complete and verifiable example]({0}) is missing.",
            url: "https://idownvotedbecau.se/nomcve",
            flagType: FlagType.Question
        }, {
            name: "No research...",
            reason: "I downvoted, because it seems like [that no or little effort in researching]({0}) has been done.",
            url: "https://idownvotedbecau.se/noresearch",
            flagType: FlagType.All
        }, {
            name: "Too much code...",
            reason: "I downvoted, because the question contains [too much and potentially unnecessary code]({0}).",
            url: "https://idownvotedbecau.se/toomuchcode",
            flagType: FlagType.All
        }, {
            name: "Too much information...",
            reason: "I downvoted, because the question contains [too much and potentially unnecessary information]({0}).",
            url: "https://idownvotedbecau.se/toomuchinfo",
            flagType: FlagType.All
        }, {
            name: "Unclear what you're asking...",
            reason: "I downvoted, because it is [unclear on what you are asking]({0}).",
            url: "https://idownvotedbecau.se/unclearquestion",
            flagType: FlagType.Question
        }, {
            name: "Unreadable code...",
            reason: "I downvoted, because [the code is poorly formatted]({0}), which makes it hard to read and shows less effort.",
            url: "https://idownvotedbecau.se/unreadablecode",
            flagType: FlagType.All
        }, {
            name: "Wrong language...",
            reason: "I downvoted, because [the post is not written in English]({0}).",
            url: "https://idownvotedbecau.se/wronglanguage",
            flagType: FlagType.All
        }, {
            name: "No reason...",
            reason: "",
            url: "",
            flagType: FlagType.All
        }
    ];
    var DownvoteHandler = /** @class */ (function () {
        function DownvoteHandler(rootElement, flagType) {
            this.eventsInitialized = false;
            this.isOpen = false;
            DownvoteHandler.initialize();
            this.flagType = flagType;
            this.rootElement = rootElement;
            this.commentSection = this.rootElement.querySelector(".comments");
            this.downvoteButton = this.rootElement.querySelector(".js-vote-down-btn");
            this.addCommentLink = this.rootElement.querySelector(".js-add-link");
            this.popup = this.generatePopup();
            this.generatePopupItems();
            this.attachEventHandler();
            DownvoteHandler.downvoteHandlers.push(this);
        }
        //#region Static Methods
        DownvoteHandler.initialize = function () {
            if (this.isInitialized)
                return;
            this.popupContainer = document.querySelector(".post-menu");
            this.isInitialized = true;
        };
        DownvoteHandler.isMouseOverPopup = function (mousePos) {
            var isHovering = !DownvoteHandler.downvoteHandlers.some(function (x) {
                var bounding = x.popup.getBoundingClientRect();
                return x.isOpen && (bounding.left > mousePos.x || bounding.left + bounding.width < mousePos.x || bounding.top > mousePos.y || bounding.top + bounding.height < mousePos.y);
            });
            return isHovering;
        };
        DownvoteHandler.getOpenPopupCount = function () {
            return DownvoteHandler.downvoteHandlers.filter(function (x) { return x.isOpen; }).length;
        };
        DownvoteHandler.closeAllPopups = function () {
            DownvoteHandler.downvoteHandlers.forEach(function (x) {
                x.closePopup.bind(x)();
            });
        };
        DownvoteHandler.globalMouseDownCallback = function (e) {
            if (!DownvoteHandler.isMouseOverPopup(e)) {
                DownvoteHandler.closeAllPopups();
            }
        };
        DownvoteHandler.globalKeyDownCallback = function (e) {
            if (e.key == "Escape") {
                DownvoteHandler.closeAllPopups();
            }
        };
        DownvoteHandler.attachGlobalEvents = function () {
            document.addEventListener("mousedown", DownvoteHandler.globalMouseDownCallback);
            document.addEventListener("keydown", DownvoteHandler.globalKeyDownCallback);
        };
        DownvoteHandler.detachGlobalEvents = function () {
            document.removeEventListener("mousedown", DownvoteHandler.globalMouseDownCallback);
            document.removeEventListener("keydown", DownvoteHandler.globalKeyDownCallback);
        };
        //#endregion
        DownvoteHandler.prototype.generatePopup = function () {
            var wrapper = document.createElement("div");
            wrapper.innerHTML = "\n            <div class=\"popup-close\"><a title=\"close this popup (or hit Esc)\">\u00D7</a></div>\n            <form>\n                <div>\n                    <h2 style=\"margin-bottom:12px;\" class=\"c-move\" data-target=\"se-draggable.handle\">\n                        I am downvoting this question because...\n                    </h2>\n                    <ul class=\"action-list\" style=\"display: flex; justify-content: space-between; flex-wrap: wrap; max-width: 600px\">\n            \n                    </ul>\n                </div>\n                <div class=\"popup-actions\">\n                    <div style=\"float:right\">\n                        <input type=\"button\" id=\"popup-cancel\" class=\"popup-submit\" style=\"float:none; margin-left:5px;\" value=\"Cancel\">\n                        <input type=\"submit\" id=\"popup-submit\" class=\"popup-submit\" style=\"float:none; margin-left:5px;\" value=\"Downvote Question\">\n                    </div>\n                </div>\n            </form>";
            wrapper.style.position = "absolute";
            wrapper.classList.add("popup");
            wrapper.classList.add("responsively-horizontally-centered-legacy-popup");
            wrapper.id = "popup-downvote-post";
            wrapper.setAttribute("data-controller", "se-draggable");
            return wrapper;
        };
        DownvoteHandler.prototype.generatePopupItems = function () {
            var _this = this;
            var actions = this.popup.querySelector(".action-list");
            downvoteReasons.filter(function (x) { return (x.flagType & _this.flagType) !== 0; }).forEach(function (x, index) {
                var li = document.createElement("li");
                li.style.width = "250px";
                li.innerHTML = "\n                <label>\n                    <input type=\"radio\" class=\"js-flag-load-close\" name=\"reason\" data-reasonindex=\"" + index + "\"" + (x.url === "" ? " checked" : "") + ">\n                    <span class=\"action-name\">" + x.name + "</span>\n                </label>\n                <a style=\"margin-left: 23px\" href=\"" + x.url + "\" target=\"_blank\">Learn more</a>\n                ";
                actions.appendChild(li);
            });
        };
        DownvoteHandler.prototype.attachEventHandler = function () {
            this.downvoteState = this.getDownvoteState();
            this.downvoteButton.addEventListener("mouseup", this.mouseupCallback.bind(this));
        };
        DownvoteHandler.prototype.mouseupCallback = function () {
            var _this = this;
            var tempState = this.getDownvoteState();
            if (!this.downvoteState && tempState) {
                this.downvoteState = tempState;
                return;
            }
            else
                this.downvoteState = tempState;
            this.openPopup();
            if (this.eventsInitialized)
                return;
            var cancelBtn = this.popup.querySelector("#popup-cancel");
            var submitBtn = this.popup.querySelector("#popup-submit");
            var closeBtn = document.querySelector(".popup-close");
            cancelBtn.addEventListener("click", (function (e) {
                _this.downvoteButton.click();
                _this.closePopup();
                e.preventDefault();
            }).bind(this));
            submitBtn.addEventListener("click", (function (e) {
                var selected = _this.popup.querySelector('input[name="reason"]:checked');
                var index = Number(selected.dataset.reasonindex);
                var selectedItem = downvoteReasons[index];
                if (selectedItem.url != "" && !_this.commentUpIfCommentExist(selectedItem.url)) {
                    _this.addCommentLink.click();
                    var commentContainer = _this.commentSection.querySelector('textarea');
                    var commentSubmit_1 = _this.commentSection.querySelector('button[type=submit].s-btn.s-btn__primary');
                    commentContainer.value = selectedItem.reason.replace("{0}", selectedItem.url);
                    setTimeout(function () {
                        commentSubmit_1.click();
                    }, 100);
                }
                e.preventDefault();
                _this.closePopup();
            }).bind(this));
            closeBtn.addEventListener("click", (function () {
                _this.closePopup();
            }).bind(this));
            this.eventsInitialized = true;
        };
        DownvoteHandler.prototype.commentUpIfCommentExist = function (url) {
            var comments = this.commentSection.querySelectorAll('.comment');
            comments.forEach(function (elem) {
                if (elem.innerHTML.indexOf(url) != -1) {
                    var upVoteButton = elem.querySelector("a.comment-up");
                    upVoteButton.click();
                    return true;
                }
            });
            return false;
        };
        DownvoteHandler.prototype.openPopup = function () {
            var _this = this;
            DownvoteHandler.closeAllPopups();
            if (DownvoteHandler.getOpenPopupCount() === 0) {
                DownvoteHandler.attachGlobalEvents();
            }
            DownvoteHandler.popupContainer.appendChild(this.popup);
            this.popup.style.top = this.calculateTop();
            this.popup.style.left = this.calculateLeft();
            setTimeout(function () {
                _this.popup.style.display = "block";
            }, 10);
            this.isOpen = true;
        };
        DownvoteHandler.prototype.closePopup = function () {
            if (!this.isOpen)
                return;
            DownvoteHandler.popupContainer.removeChild(this.popup);
            this.isOpen = false;
            if (DownvoteHandler.getOpenPopupCount() === 0) {
                DownvoteHandler.detachGlobalEvents();
            }
        };
        DownvoteHandler.prototype.calculateTop = function () {
            var boundings = this.popup.getBoundingClientRect();
            return "calc(50vh - " + boundings.height / 2 + "px + " + window.pageYOffset + "px - 50px)";
        };
        DownvoteHandler.prototype.calculateLeft = function () {
            var boundings = this.popup.getBoundingClientRect();
            return "calc(50% - " + boundings.width / 2 + "px)";
        };
        DownvoteHandler.prototype.getDownvoteState = function () {
            return this.downvoteButton.getAttribute("aria-pressed") == "true";
        };
        DownvoteHandler.downvoteHandlers = [];
        DownvoteHandler.isInitialized = false;
        return DownvoteHandler;
    }());
    //#endregion
    //#region Startup
    var observer = new MutationObserver(function (mutations, me) {
        var btn = document.querySelector(".question .js-vote-down-btn");
        if (btn) {
            Core();
            me.disconnect();
            return;
        }
    });
    observer
        .observe(document, {
        childList: true,
        subtree: true
    });
    //#endregion
    function Core() {
        var question = document.querySelector(".question");
        var answers = document.querySelectorAll("#answers .answer");
        new DownvoteHandler(question, FlagType.Question);
        answers.forEach(function (answer) { return new DownvoteHandler(answer, FlagType.Answer); });
    }
})();
