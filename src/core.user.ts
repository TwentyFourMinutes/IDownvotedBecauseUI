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

    enum FlagType {
        Question = 1,
        Answer = 2,
        All = 3
    }

    const downvoteReasons: { name: string, reason: string, url: string, flagType: FlagType }[] = [
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

    class DownvoteHandler {
        public static downvoteHandlers: DownvoteHandler[] = [];

        private static popupContainer: HTMLElement;
        private static isInitialized: boolean = false;

        private readonly rootElement: HTMLElement;
        private readonly downvoteButton: HTMLElement;
        private readonly commentSection: HTMLElement;
        private readonly addCommentLink: HTMLElement;
        private readonly flagType: FlagType;
        private readonly popup: HTMLElement;

        private downvoteState: boolean;
        private eventsInitialized: boolean = false;
        private isOpen: boolean = false;

        constructor(rootElement: HTMLElement, flagType: FlagType) {
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

        private static initialize(): void {
            if (this.isInitialized)
                return;

            this.popupContainer = document.querySelector(".post-menu");

            this.isInitialized = true;
        }

        private static isMouseOverPopup(mousePos: MouseEvent): boolean {
            let isHovering: boolean = !DownvoteHandler.downvoteHandlers.some(x => {
                let bounding: DOMRect = x.popup.getBoundingClientRect();

                return x.isOpen && (bounding.left > mousePos.x || bounding.left + bounding.width < mousePos.x || bounding.top > mousePos.y || bounding.top + bounding.height < mousePos.y);
            });

            return isHovering;
        }

        private static getOpenPopupCount(): number {
            return DownvoteHandler.downvoteHandlers.filter(x => x.isOpen).length;
        }

        private static closeAllPopups(): void {
            DownvoteHandler.downvoteHandlers.forEach(x => {
                x.closePopup.bind(x)();
            });
        }

        private static globalMouseDownCallback(e: MouseEvent): void {
            if (!DownvoteHandler.isMouseOverPopup(e)) {
                DownvoteHandler.closeAllPopups();
            }
        }

        private static globalKeyDownCallback(e: KeyboardEvent): void {
            if (e.key == "Escape") {
                DownvoteHandler.closeAllPopups();
            }
        }

        private static attachGlobalEvents(): void {
            document.addEventListener("mousedown", DownvoteHandler.globalMouseDownCallback);
            document.addEventListener("keydown", DownvoteHandler.globalKeyDownCallback);
        }

        private static detachGlobalEvents(): void {
            document.removeEventListener("mousedown", DownvoteHandler.globalMouseDownCallback);
            document.removeEventListener("keydown", DownvoteHandler.globalKeyDownCallback);
        }

        //#endregion

        private generatePopup(): HTMLElement {
            let wrapper = document.createElement("div");
            wrapper.innerHTML = `
            <div class="popup-close"><a title="close this popup (or hit Esc)">×</a></div>
            <form>
                <div>
                    <h2 style="margin-bottom:12px;" class="c-move" data-target="se-draggable.handle">
                        I am downvoting this question because...
                    </h2>
                    <ul class="action-list" style="display: flex; justify-content: space-between; flex-wrap: wrap; max-width: 600px">
            
                    </ul>
                </div>
                <div class="popup-actions">
                    <div style="float:right">
                        <input type="button" id="popup-cancel" class="popup-submit" style="float:none; margin-left:5px;" value="Cancel">
                        <input type="submit" id="popup-submit" class="popup-submit" style="float:none; margin-left:5px;" value="Downvote Question">
                    </div>
                </div>
            </form>`;
            wrapper.style.position = "absolute";
            wrapper.classList.add("popup");
            wrapper.classList.add("responsively-horizontally-centered-legacy-popup");
            wrapper.id = "popup-downvote-post";
            wrapper.setAttribute("data-controller", "se-draggable");

            return wrapper;
        }

        private generatePopupItems(): void {
            let actions: HTMLElement = this.popup.querySelector(".action-list");

            downvoteReasons.filter(x => (x.flagType & this.flagType) !== 0).forEach((x, index) => {
                let li: HTMLElement = document.createElement("li");
                li.style.width = "250px";
                li.innerHTML = `
                <label>
                    <input type="radio" class="js-flag-load-close" name="reason" data-reasonindex="${index}"${x.url === "" ? " checked" : ""}>
                    <span class="action-name">${x.name}</span>
                </label>
                <a style="margin-left: 23px" href="${x.url}" target="_blank">Learn more</a>
                `;

                actions.appendChild(li);
            });
        }

        private attachEventHandler(): void {
            this.downvoteState = this.getDownvoteState();
            this.downvoteButton.addEventListener("mouseup", this.mouseupCallback.bind(this));
        }

        private mouseupCallback(): void {
            let tempState: boolean = this.getDownvoteState();

            if (!this.downvoteState && tempState) {
                this.downvoteState = tempState;
                return;
            } else
                this.downvoteState = tempState;

            this.openPopup();

            if (this.eventsInitialized)
                return;

            let cancelBtn: HTMLElement = this.popup.querySelector("#popup-cancel");
            let submitBtn: HTMLElement = this.popup.querySelector("#popup-submit");
            let closeBtn: HTMLElement = document.querySelector(".popup-close");

            cancelBtn.addEventListener("click", (e => {
                this.downvoteButton.click();
                this.closePopup();
                e.preventDefault();
            }).bind(this));

            submitBtn.addEventListener("click", (e => {
                let selected: HTMLElement = this.popup.querySelector('input[name="reason"]:checked');
                let index: number = Number(selected.dataset.reasonindex);

                let selectedItem = downvoteReasons[index];

                if (selectedItem.url != "" && !this.commentUpIfCommentExist(selectedItem.url)) {
                    this.addCommentLink.click();

                    let commentContainer: HTMLTextAreaElement = this.commentSection.querySelector('textarea');
                    let commentSubmit: HTMLElement = this.commentSection.querySelector('button[type=submit].s-btn.s-btn__primary');

                    commentContainer.value = selectedItem.reason.replace("{0}", selectedItem.url);

                    setTimeout(() => {
                        commentSubmit.click();
                    }, 100);
                }

                e.preventDefault();
                this.closePopup();
            }).bind(this));

            closeBtn.addEventListener("click", (() => {
                this.closePopup();
            }).bind(this));

            this.eventsInitialized = true;
        }

        private commentUpIfCommentExist(url) {
            let comments: NodeListOf<HTMLElement> = this.commentSection.querySelectorAll('.comment');

            comments.forEach(elem => {
                if (elem.innerHTML.indexOf(url) != -1) {
                    let upVoteButton: HTMLElement = elem.querySelector("a.comment-up");
                    upVoteButton.click();
                    return true;
                }
            });

            return false;
        }

        private openPopup(): void {
            DownvoteHandler.closeAllPopups();

            if (DownvoteHandler.getOpenPopupCount() === 0) {
                DownvoteHandler.attachGlobalEvents();
            }

            DownvoteHandler.popupContainer.appendChild(this.popup);

            this.popup.style.top = this.calculateTop();
            this.popup.style.left = this.calculateLeft();

            setTimeout(() => {
                this.popup.style.display = "block";
            }, 10);

            this.isOpen = true;
        }

        private closePopup(): void {
            if (!this.isOpen)
                return;

            DownvoteHandler.popupContainer.removeChild(this.popup);

            this.isOpen = false;

            if (DownvoteHandler.getOpenPopupCount() === 0) {
                DownvoteHandler.detachGlobalEvents();
            }
        }

        private calculateTop(): string {
            let boundings: DOMRect = this.popup.getBoundingClientRect();

            return `calc(50vh - ${boundings.height / 2}px + ${window.pageYOffset}px - 50px)`
        }

        private calculateLeft(): string {
            let boundings: DOMRect = this.popup.getBoundingClientRect();

            return `calc(50% - ${boundings.width / 2}px)`
        }

        private getDownvoteState(): boolean {
            return this.downvoteButton.getAttribute("aria-pressed") == "true";
        }
    }

    //#endregion

    //#region Startup

    let observer: MutationObserver = new MutationObserver(function (mutations: MutationRecord[], me: MutationObserver) {
        let btn: HTMLElement = document.querySelector(".question .js-vote-down-btn");
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
        let question: HTMLElement = document.querySelector(".question");
        let answers: NodeListOf<HTMLElement> = document.querySelectorAll("#answers .answer");

        new DownvoteHandler(question, FlagType.Question);
        answers.forEach(answer => new DownvoteHandler(answer, FlagType.Answer));
    }
})();