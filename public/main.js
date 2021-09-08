// @ts-check

import { APIWrapper, API_EVENT_TYPE } from "./api.js";
import {
  addMessage,
  animateGift,
  isPossiblyAnimatingGift,
  isAnimatingGiftUI,
} from "./dom_updates.js";

const api = new APIWrapper();

function getNow() {
  return (
    Number(new Date().toString().split(" ")[4].split(":")[0]) * 60 * 60 +
    Number(new Date().toString().split(" ")[4].split(":")[1]) * 60 +
    Number(new Date().toString().split(" ")[4].split(":")[2])
  );
}

function eventTime(e) {
  return (
    Number(e.timestamp.toString().split(" ")[4].split(":")[0]) * 60 * 60 +
    Number(e.timestamp.toString().split(" ")[4].split(":")[1]) * 60 +
    Number(e.timestamp.toString().split(" ")[4].split(":")[2])
  );
}

api.setEventHandler(async (events) => {
  async function eventHandler() {
    let agItems = [];
    let mItems = [];
    let gItems = [];
    let myEvents = [];
    myEvents.push(events);
    //if there are multiple events
    if (myEvents[0].length > 1) {
      async function runMultipleEvents() {
        await new Promise((res, rej) => {
          setTimeout(res, 500);
        });
        for (const events of myEvents) {
          events.forEach((event) => {
            //user see ag messages first in .messages
            if (event.type == "ag") {
              agItems.push(event);
            } else if (event.type == "m") {
              mItems.push(event);
            } else {
              gItems.push(event);
            }
          });
          let modifiedArray = [...gItems, ...mItems, ...agItems];

          for (const event of modifiedArray) {
            if (event.type == API_EVENT_TYPE.ANIMATED_GIFT) {
              //wait until animation ends
              async function animatedGift() {
                if (isPossiblyAnimatingGift() || isAnimatingGiftUI()) {
                  await new Promise((res, rej) => setTimeout(res, 2000));
                } else {
                  await new Promise((res, rej) => setTimeout(res, 0));
                }

                addMessage(event);
                animateGift(event);

                //if there is no animation send to ui
              }
              await animatedGift();
            } else if (event.type == API_EVENT_TYPE.MESSAGE) {
              async function message() {
                await new Promise((res, rej) => {
                  setTimeout(res, 0);
                });
              }
              if (!(getNow() - eventTime(event) > 20)) {
                addMessage(event);
              }
              await message();
            } else if (event.type == API_EVENT_TYPE.GIFT) {
              async function gift() {
                await new Promise((res, rej) => {
                  setTimeout(res, 0);
                });
                addMessage(event);
              }
              await gift();
            }
          }
        }
      }
      await runMultipleEvents();
    }
    //if there is only one event
    else {
      async function runOneEvent() {
        await new Promise((res) => setTimeout(res, 500));
        for (const events of myEvents) {
          events.forEach((event) => {
            if (event.type == "ag") {
              agItems.push(event);
            } else if (event.type == "m") {
              mItems.push(event);
            } else {
              gItems.push(event);
            }
          });
          let modifiedArray = [...gItems, ...mItems, ...agItems];

          for (const event of modifiedArray) {
            if (event.type == API_EVENT_TYPE.ANIMATED_GIFT) {
              //wait until animation ends
              async function animatedGift() {
                if (isPossiblyAnimatingGift() || isAnimatingGiftUI()) {
                  await new Promise((res, rej) => setTimeout(res, 2000));
                } else {
                  await new Promise((res, rej) => setTimeout(res, 0));
                }
                addMessage(event);
                animateGift(event);

                //if there is no animation send to ui
              }
              await animatedGift();
            } else if (event.type == API_EVENT_TYPE.MESSAGE) {
              //if message is older than 20 secs then do not display
              async function message() {
                await new Promise((res, rej) => {
                  setTimeout(res, 0);
                });
              }
              if (!(getNow() - eventTime(event) > 20)) {
                addMessage(event);
              }
              await message();
            } else if (event.type == API_EVENT_TYPE.GIFT) {
              async function gift() {
                await new Promise((res, rej) => {
                  setTimeout(res, 0);
                });
                addMessage(event);
              }
              await gift();
            }
          }
        }
      }
      await runOneEvent();
    }
  }
  await eventHandler();
});

// NOTE: UI helper methods from `dom_updates` are already imported above.
