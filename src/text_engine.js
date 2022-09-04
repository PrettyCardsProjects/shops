

class TypedText {

    constructor(text, parent) {
        this.speed = 33; // The miliseconds between displaying letters.
        this.nextWait = this.speed;
        this.container = document.createElement("DIV");
        parent.appendChild(this.container);
        this.text = text;
        this.currentPage = -1;
        this.currentLetter = 0;
        this.instant = false;
        this.userInstant = false;
        this.noskip = false;
        if (typeof(text) == "string") {
            this.text = [text];
        }
        this.InitTextCommands();
        this.NextPage();
    }

    ResetTextArea() {
        this.container.innerHTML = "";
        this.StartNewParagraph(true);
        this.currentLetter = 0;
    }

    SetHeight(sizeParent = true) {
        while (!this.IsPageDone()) {
            this.Progress();
        }
        var sizeElem = sizeParent ? this.container.parentElement : this.container;
        var copy = sizeElem.cloneNode(true);
        copy.style.width = sizeElem.getBoundingClientRect().width + "px";
        copy.style.transition = "none";
        document.body.appendChild(copy);
        var height = copy.getBoundingClientRect().height;
        sizeElem.style.height = height + "px";
        this.ResetTextArea();
    }

    NextPage() {
        this.userInstant = false;
        this.ResetTextArea();
        this.currentPage++;console.log(this.currentPage);
        if (this.currentPage >= this.text.length) {
            this.Remove();
            return;
        }
        this.SetHeight();
        this.Progress();
        this.TimeLoop();
    }

    InitTextCommands() {
        // Returns true if a new iteration of the Progress function should be called immediately after.
        this.textCommands = {
            style: (className) => {
                this.StartNewSpan(className);
                return true;
            },
            speed: (ms) => {
                this.speed = Number(ms);
                return false;
            },
            w: (ms) => {
                this.nextWait = Number(ms) || 0;
                return false;
            },
            instant: (arg) => {
                this.instant = arg === "" || arg === "on" || arg === "true";
                /*
                if (this.instant) {
                    clearTimeout(this.lastTimeout);
                } else {
                    this.TimeLoop();
                }
                */
                return false;
            },
            noskip: (arg) => {
                this.noskip = arg === "" || arg === "on" || arg === "true";
                if (this.noskip) {
                    this.userInstant = false;
                }
                return true;
            }
        }
    }

    UserSkip() {
        if (!this.noskip) {
            this.userInstant = true;
            return true;
        }
        return false;
    }

    Remove() {
        clearTimeout(this.lastTimeout);
        this.container.remove();
    }

    StartNewParagraph(reset = false) {
        this.currentParagraph = document.createElement("DIV"); // Bootstrap and other stuff mess with paragraphs, so I had to change this.
        this.currentParagraph.className = "PrettyCards_UTTextParagraph";
        this.container.appendChild(this.currentParagraph);
        this.StartNewSpan((this.currentSpan && !reset) ? this.currentSpan.className : "");
        //this.StartNewSpan("");
        return this.currentParagraph;
    }

    StartNewSpan(className) {
        this.currentSpan = document.createElement("SPAN");
        this.currentSpan.className = className;
        this.currentParagraph.appendChild(this.currentSpan);
        return this.currentSpan;
    }

    Progress() {
        if (this.IsPageDone()) {
            return;
        }
        var currStr = this.text[this.currentPage];
        var isSkipped = this.currentLetter > 0 && currStr.charAt(this.currentLetter-1) === "\\";
        var nextChar = currStr.charAt(this.currentLetter);
        // "[" indicated the beginning of a command UNLESS skipped, therefore should be redirected to the outer if's "else" part.
        // "\\" indicates the skipping of a character (unless skipped), but it should not be displayed, therefore nothing should happen in that case.
        if (nextChar !== "[" || isSkipped) {
            if (nextChar !== "\\" || isSkipped) {
                if (nextChar === "\n") {
                    this.StartNewParagraph();
                } else if (nextChar === "\r") {
                    this.currentSpan.innerHTML += "<br>";
                } else {
                    this.currentSpan.innerHTML += nextChar;
                }
            }
            this.currentLetter++;
        } else {
            // Command Code. Buckle up, cuz this will be a wild ride!
            var commandEnd = currStr.indexOf("]", this.currentLetter);
            if (commandEnd < 0) {
                throw "Error in command parsing for string: " + currStr;
            }
            var commandStr = currStr.substring(this.currentLetter, commandEnd + 1);
            var argSepPos = commandStr.indexOf(":");
            var cmdName;
            var cmdArg = "";
            if (argSepPos < 0) {
                cmdName = commandStr.substring(1, commandStr.length-1);
            } else {
                cmdName = commandStr.substring(1, argSepPos);
                cmdArg = commandStr.substring(argSepPos + 1, commandStr.length-1);
            }

            this.currentLetter = commandEnd + 1;

            var cmdFunc = this.textCommands[cmdName];
            if (!cmdFunc) {
                throw `Invalid command name "${cmdName}" in string: ${currStr}`;
            }
            if (cmdFunc(cmdArg)) {
                this.Progress();
            }
        }
        if ( (this.instant || this.userInstant) && !this.IsPageDone()) {
            this.Progress();
        }
    }

    IsPageDone() {
        return this.currentLetter >= this.text[this.currentPage].length;
    }

    TimeLoop() {
        if (!this.IsPageDone()) {
            this.lastTimeout = setTimeout(function() {
                this.nextWait = this.speed;
                this.Progress();
                this.TimeLoop();
            }.bind(this), this.nextWait);
        }
    }

}

export {TypedText};