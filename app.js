//Game Data Object
let gameData = {
    round: 1,
    assemblyShip: {},
    enemyAmount: 6,
    enemyShips: [],
    enemyShipDivs: ["enemyShip", ["bobbingDiv", ["antenna", ["ball", "wire", "attachmentContainer", ["attachment"]], "aboveShipContainer", ["aboveShip"], "shipTop", "hullHolder", ["enemyHull", [], "hullGlass", []], "shipBottom", "underShipContainer", ["underShip"]]]],
    shipsDestroyed: 0,
    maxEnemyHull: 6
}

//Ship construction
class Ship {
    constructor(id, hull, firepower, accuracy) {
        this.hull = hull;
        this.firepower = firepower;
        this.accuracy = accuracy;
        this.id = id;
    }
}
class PlayerShip extends Ship {
    constructor(id, hull, firepower, accuracy) {
        super(id, hull, firepower, accuracy)
    }
    onHit(damage) {
        let consoleDiv = document.querySelector('.playerConsole')
        consoleDiv.style.animation = "directHit 1s 1 alternate";
        adjustPrintout("Hull damaged!");
        let hullDiv = document.querySelector('.playerHullPts');
        let currentHullPt = hullDiv.lastElementChild;
        if (this.hull < damage) {
            damage = this.hull;
        }
        for (let i = 0; i < damage; i++) {
            while (currentHullPt.style.opacity === "0") {
                if (currentHullPt.previousSibling) {
                    currentHullPt = currentHullPt.previousElementSibling;
                } else {
                    break;
                }
            }
            currentHullPt.style.opacity = "0"
        }
        setTimeout(function() {
            consoleDiv.style.animation = 'none';
        }, 1000);
        this.hull -= damage;
        if (this.hull <= 0) {
            this.destroy();
        } else {
            whoseTurn('player')
        }
    }
    destroy() {
        adjustPrintout("Ship destroyed...");
        setTimeout(function() {
            openDialogue('youLose');
        }, 1000);
    }
    onTurn() {
        powerDown();
        let damage = gameData.assemblyShip.firepower;
        if (Math.random() < gameData.assemblyShip.accuracy) {
            animateShot("hit");
            setTimeout(function() {
                let explosionDiv = document.querySelector('.explosion');
                explosionDiv.style.opacity = "1";
                setTimeout(function() {
                    explosionDiv.style.opacity = "0";
                }, 500);
            }, 750);
            setTimeout(function() {
                gameData.enemyShips[0].onHit(damage)
            }, 1250);
        } else {
            animateShot("miss");
            setTimeout(function() {
                adjustPrintout("You missed!");
            }, 1000);
            setTimeout(function() {
                whoseTurn('computer');
            }, 2000);
        }
    }
}

class EnemyShip extends Ship {
    constructor(id) {
        super(id);
        this.hull = getRandomIntBetween(3, gameData.maxEnemyHull);
        this.firepower = getRandomIntBetween(2, 4);
        this.accuracy = getRandomBetween(.6, .8)
    }
    onHit(damage) {
        this.hull -= damage;
        //animate ship moving around to show hit
        if (this.hull <= 0) {
            this.destroy();
        } else {
            adjustPrintout("Enemy hit!");
            let enemyHull = document.querySelector('.enemyHull');
            for (let i = 0; i < damage; i++) {
                let currentHullPt = enemyHull.lastElementChild;
                while (currentHullPt.style.opacity === "0") {
                    currentHullPt = currentHullPt.previousElementSibling;
                }
                currentHullPt.style.opacity = "0";
            }
            setTimeout(function() {
                whoseTurn('computer');
            }, 500);
        }
    }
    destroy() {
        adjustPrintout("Enemy destroyed!");
        let enemyShipSection = document.getElementById('enemyShips');
        let thisShip = document.getElementById(this.id);
        thisShip.style.opacity = 0;
        gameData.enemyShips.shift();
        if (!gameData.enemyShips.length) {
            enemyShipSection.removeChild(thisShip);
            openDialogue('youWin')
        } else {
            let currentShip = thisShip;
            let counter = 2;
            let zIndex = 20;
            let animationTiming = 2000;
            let hasSibling = Boolean(currentShip.nextSibling);
            while (hasSibling) {
                currentShip = currentShip.nextElementSibling;
                currentShip.style.animation = `ship${counter}Move ${animationTiming}ms 1`;
                currentShip.style.animationDirection = 'normal';
                currentShip.style.animationTimingFunction = 'ease-out';
                currentShip.style.animationFillMode = 'forwards';
                currentShip.style.zIndex = zIndex;
                zIndex--;
                counter++;
                hasSibling = Boolean(currentShip.nextSibling);
            }
            setTimeout(function() {
                let shipToRelocate = enemyShipSection.firstElementChild;
                let hasSibling = Boolean(shipToRelocate.nextSibling);
                counter = 1;
                shipToRelocate.style.margin = 0;
                shipToRelocate.style.animation = "none";
                while (hasSibling) {
                    counter++;
                    shipToRelocate = shipToRelocate.nextElementSibling;
                    if (counter < 5) {
                        shipToRelocate.style.margin = 0;
                    } else {
                        shipToRelocate.style.margin = "160px 0px 0px 0px";
                    }
                    shipToRelocate.style.animation = "none";
                    hasSibling = Boolean(shipToRelocate.nextSibling);
                }
                if (enemyShipSection.hasChildNodes) {
                    enemyShipSection.removeChild(thisShip)
                };
            }, animationTiming);
            openDialogue('enemyDestroyed');
            setTimeout(function() {
                whoseTurn('player');
            }, animationTiming);
        }
    }
    onTurn() {
        setTimeout(function() {
            adjustPrintout("Enemy fires!");
        }, 750);
        let enemyShot = document.querySelector('.ringsContainer');
        let damage = this.firepower;
        enemyShot.style.opacity = 1;
        if (Math.random() < this.accuracy) {
            enemyShot.style.animation = "ringHit 2s 1 cubic-bezier(.57,.08,.67,1.03)";
            setTimeout(function() {
                gameData.assemblyShip.onHit(damage);
            }, 2000);
        } else {
            enemyShot.style.animation = "ringMiss 2s 1 cubic-bezier(.57,.08,.67,1.03)";
            setTimeout(function() {
                adjustPrintout("Enemy missed!");
            }, 2000);
        }
        setTimeout(function() {
            enemyShot.style.opacity = 0;
            enemyShot.style.animation = "none";
            whoseTurn("player");
        }, 1950);
    }
}

//adapted from W3Schools
function getRandomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function getRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function shipConstruction() {
    //empties what was there before
    gameData.enemyShips = [];
    let enemyShipSection = document.getElementById('enemyShips');
    enemyShipSection.style.marginTop = "-850px";
    while (enemyShipSection.hasChildNodes()) {
        enemyShipSection.removeChild(enemyShipSection.firstChild);
    }
    //initializes the assemblyShip
    gameData.assemblyShip = new PlayerShip("assemblyShip", 20, 5, .7);
    let playerPts = document.querySelectorAll('.playerHullPt');
    for (let h = 0; h < playerPts.length; h++) {
        playerPts[h].style.opacity = "1";
    }
    //initializes the enemyShips array (with ships)
    for (let i = 1; i <= gameData.enemyAmount; i++) {
        let shipID = "ship" + i.toString();
        let currentShip = new EnemyShip(shipID);
        gameData.enemyShips.push(currentShip);
    }
    //iterate across enemyShips to create divs
    let overallParent = document.getElementById('enemyShips');
    for (let i = 0; i < gameData.enemyAmount; i++) {
        makeShip(overallParent, gameData.enemyShipDivs, i+1)
    }
    //set opacity of all Enemy Hull to 0 (to work with enemy.onHit())
    let hullPts = document.querySelectorAll('.hullPt');
    for (let m = 0; m < hullPts.length; m++) {
        hullPts[m].style.opacity = 0;
    }
    //this sets how the hull grids work, so when hull size increases...
    let hullStyle = document.querySelectorAll(".enemyHull");
    let windowStyle = document.querySelectorAll(".hullGlass");
    for (let j = 0; j < hullStyle.length; j++) {
        hullStyle[j].style.gridTemplateColumns = `repeat(${gameData.maxEnemyHull}, auto)`;
        //sets opacity of working hull to 1
        let firstHullChild = hullStyle[j].firstElementChild;
        for (let l = 0; l < gameData.enemyShips[j].hull; l++) {
            firstHullChild.style.opacity = 1;
            firstHullChild = firstHullChild.nextElementSibling;
        }
    }
    for (let k = 0; k < hullStyle.length; k++) {
        windowStyle[k].style.gridTemplateColumns = `repeat(${gameData.maxEnemyHull}, auto)`;
    }
}
//end Ship Construction

function animateShot(hitOrMiss) {
    let rayDivLeft = document.querySelector(".playerFireLeft");
    let rayDivRight = document.querySelector('.playerFireRight');
    let firstAlienShip = document.getElementById('enemyShips').firstElementChild;
    if (hitOrMiss === "hit") {
        rayDivLeft.style.animation = "playerFireHit .75s 1";
        rayDivRight.style.animation = "playerFireHit .75s 1";
    } else if (hitOrMiss === "miss") {
        firstAlienShip.style.animation = "enemyMoveMiss 2s 1";
        rayDivLeft.style.animation = "playerFireMiss 2.5s 1";
        rayDivRight.style.animation = "playerFireMiss 2.5s 1";
    }
    setTimeout(function() {
        rayDivLeft.style.animation = "none";
        rayDivRight.style.animation = "none";
        firstAlienShip.style.animation = "none";
    }, 2500);
};

function whoseTurn(who) {
    switch(who) {
        case "player":
            powerUp();
            break;
        case "computer":
            gameData.enemyShips[0].onTurn();
    }
}

//dialogue functions
function makeButton() {
    let newButton = document.createElement('button');
    newButton.setAttribute("onclick", "openDialogue('retreat')");
    newButton.setAttribute("id", "retreat");
    let buttonText = document.createTextNode("Retreat!");
    newButton.appendChild(buttonText);
    let buttons = document.getElementById('buttons');
    buttons.insertBefore(newButton, buttons.childNodes[0]);
}

function dialogue(event) {
    let background = document.getElementById("greyBackground");
    let box = document.querySelector(".dialogueBox");
    let header = document.getElementById("dialogueHeader");
    let graf = document.getElementById("dialogueGraf");
    let button = document.getElementById("dialogueClose");
    let returnDuringBattle = "closeDialogue('return')"
    let restartBattle = "closeDialogue('restart')"
    switch(event) {
        case 'enemyDestroyed':
            background.style.background = 'rgba(0,0,0,0.25)';
            box.style.marginBottom = "-425px";
            header.innerHTML = 'Ship Destroyed!';
            graf.innerHTML = '';
            button.innerHTML = 'Keep fighting!'
            button.setAttribute('onclick', returnDuringBattle);
            break;
        case 'retreat':
            //ships should totally raise back out where they can be reset;
            background.style.background = 'rgba(0,0,0,1)';
            printerReset();
            box.style.marginBottom = "0px";
            gameData.round = 1;
            gameData.maxEnemyHull = 6;
            header.innerHTML = 'Retreat!';
            graf.innerHTML = 'The aliens have retreated to marshal their forces too.';
            button.innerHTML = 'Try again?'
            button.setAttribute('onclick', restartBattle);
            break;
        case 'youLose':
            //ships should lower
            //then pop back to starting position
            background.style.background = 'rgba(0,0,0,1)';
            printerReset();
            box.style.marginBottom = "0px";
            gameData.round = 1;
            gameData.maxEnemyHull = 6;
            header.innerHTML = 'You exploded!';
            graf.innerHTML = 'You pressed your luck a little too far. Hopefully the aliens have a zoo so some humans survive.';
            button.innerHTML = 'Try again?'
            button.setAttribute('onclick', restartBattle);
            break;
        case 'youWin':
            //raise ship div
            background.style.background = 'rgba(0,0,0,0.25)';
            box.style.marginBottom = "0px";
            gameData.round++;
            gameData.maxEnemyHull++
            header.innerHTML = 'You win!';
            graf.innerHTML = 'You defeated the alien threat! But a stronger wave is on its way...';
            button.innerHTML = 'Battle again?'
            powerUp();
            button.setAttribute('onclick', restartBattle);
            break;
    }
}

function openDialogue(event) {
    if (event === 'enemyDestroyed') {
        makeButton();
    } else if (event === 'retreat') {
        let retreatButton = document.getElementById("retreat");
        retreatButton.remove();
    }
    dialogue(event);
    let backgroundStyle = document.querySelector(".greyedOut").style
    backgroundStyle.opacity = 1;
    backgroundStyle.pointerEvents = "auto";
}
function closeDialogue(event) {
    if (event === 'return') {
        let retreatButton = document.getElementById("retreat");
        retreatButton.remove();
    } else if (event === 'restart') {
        resetGame();
    }
    let backgroundStyle = document.querySelector(".greyedOut").style
    backgroundStyle.opacity = 0;
    backgroundStyle.pointerEvents = "none";
}

/* Background functions */
function makeShip(parent, array, index) {
    let parentDiv = document.createElement('div');
    parentDiv.classList.add(array[0]);
    if (array[0] === 'enemyShip') {
        parentDiv.setAttribute('id', `ship${index}`)
    }
    parent.appendChild(parentDiv);
    for (let i = 1; i < array.length; i++) {
        if (typeof array[i] === 'string') {
        let currentDiv = document.createElement('div');
        currentDiv.classList.add(array[i]);
        parent.appendChild(currentDiv);
        parentDiv = currentDiv;
        } else {
        makeShip(parentDiv, array[i])
        }
    }
}

function randomizeBobAnimation() {
    let currentShip = document.getElementById('enemyShips').firstElementChild;
    for (let i = 0; i < gameData.enemyShips.length; i++) {
        let randomDelay = Math.random() * -4;
        let delayStyle = randomDelay.toString() + "s";
        currentShip.firstElementChild.style.animationDelay = delayStyle;
        currentShip = currentShip.nextElementSibling;
    }
}
function adjustPrintout(string) {
    let printout = document.querySelector('.printoutActual');
    let firstChild = printout.firstElementChild
    firstChild.innerText = string;
    printout.style.transition = "500ms";
    printout.style.marginTop = "-5%";
    setTimeout(function() {
        let newEmptyTag = document.createElement('p');
        newEmptyTag.innerHTML = "<br />"
        printout.insertBefore(newEmptyTag, firstChild);
        printout.style.transition = "none";
        printout.style.marginTop = "-25%";
    }, 500);
}
function powerDown() {
    let powerDiv = document.querySelector('.powerOn');
    let button = document.querySelector('.buttonContainer');
    setTimeout(function() {
        button.style.pointerEvents = "none";
    }, 1);
    let currentChild = powerDiv.firstElementChild;
    for (let i = 1; i <= 5; i++) {
        let timing = i * 100;
        setTimeout(function() {
            currentChild.style.opacity = 0;
            if (currentChild.nextSibling) {
                currentChild = currentChild.nextElementSibling;
            }
        }, timing);
    }
}
function powerUp() {
    let powerDiv = document.querySelector('.powerOn');
    let button = document.querySelector('.buttonContainer');
    let currentChild = powerDiv.lastElementChild;
    for (let i = 1; i <= 5; i++) {
        let timing = i * 100;
        setTimeout(function() {
            currentChild.style.opacity = 1;
            if (currentChild.previousSibling) {
                currentChild = currentChild.previousElementSibling;
            }
        }, timing);
    }
    setTimeout(function() {
        button.style.pointerEvents = "auto";
    }, 500);
}

function printerReset() {
    let printerPaper = document.querySelector('.printoutActual');
    while (printerPaper.hasChildNodes()) {
        printerPaper.removeChild(printerPaper.firstChild);
    }
    for (let i = 0; i < 3; i++) {
        let newP = document.createElement('P');
        let newBreak = document.createElement('BR');
        newP.appendChild(newBreak);
        printerPaper.appendChild(newP);
    }
}

function lowerShips() {
    let shipSelector = document.querySelector('.enemyShips');
    shipSelector.style.animation = "enemyArrival 3s 1 forwards";
    setTimeout(function() {
        shipSelector.style.marginTop = "-300px";
        shipSelector.style.animation = "none";
    }, 3000);
}

function switchColor() {
    setInterval(function() {
      let bursts = 6;
      for (let i = 1; i <= bursts; i++) {
        let burstClass = `.burst${i}`;
        let smBurstClass = `.smallBurst${i}`;
        let smallestBurstClass = `.smallestBurst${i}`;
        document.querySelector(burstClass).style.background = 'var(--yellowBurst)';
        document.querySelector(smBurstClass).style.background = 'var(--redBurst)';
        document.querySelector(smallestBurstClass).style.background = 'var(--yellowBurst)';
        document.querySelector('.burstText').style.color = 'var(--redBurst)';
      };
      setTimeout(function() {
        for (let j = 1; j <= bursts; j++) {
          let burstClass = `.burst${j}`
          let smBurstClass = `.smallBurst${j}`
          let smallestBurstClass = `.smallestBurst${j}`;
          document.querySelector(burstClass).style.background = 'var(--redBurst)';
          document.querySelector(smBurstClass).style.background = 'var(--yellowBurst)';
          document.querySelector(smallestBurstClass).style.background = 'var(--redBurst)';
          document.querySelector('.burstText').style.color = 'var(--yellowBurst)';
        };
      }, 125);
    }, 250);
  };
switchColor();

function setHull() {
    gameData.enemyShipDivs[1][1][6][1] = [];
    gameData.enemyShipDivs[1][1][6][3] = [];
    for (let i = 0; i < gameData.maxEnemyHull; i++) {
        gameData.enemyShipDivs[1][1][6][1].push("hullPt");
        gameData.enemyShipDivs[1][1][6][3].push("enemyWindow");
    }
}

function resetGame() {
    setHull();
    shipConstruction();
    randomizeBobAnimation();
    lowerShips();
}
resetGame();