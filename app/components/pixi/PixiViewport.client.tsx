// Based on https://codepen.io/inlet/pen/yLVmPWv.
// Copyright (c) 2018 Patrick Brouwer, distributed under the MIT license.
"use client"
import { PixiComponent, useApp } from '@pixi/react';
import { Viewport } from 'pixi-viewport';
import { Application } from 'pixi.js';
import { MutableRefObject, ReactNode } from 'react';
import { EventSystem } from "@pixi/events";
import { ClickedEvent } from 'pixi-viewport/dist/types';
import { FederatedPointerEvent } from "pixi.js";

export type ViewportProps = {
  app: Application;
  viewportRef?: MutableRefObject<Viewport | undefined>;
  screenWidth: number;
  screenHeight: number;
  worldWidth: number;
  worldHeight: number;
  children?: ReactNode;
  onClicked?: (e: ClickedEvent) => void
  onPointerDown?: (e: FederatedPointerEvent) => void
  onPointerMove?: (e: FederatedPointerEvent) => void
  onPointerUp?: (e: FederatedPointerEvent) => void
};

// https://davidfig.github.io/pixi-viewport/jsdoc/Viewport.html
export default PixiComponent('Viewport', {
  create(props: ViewportProps) {
    const { app, children, viewportRef, onClicked, onPointerDown, onPointerMove, onPointerUp, ...viewportProps } = props;
    const events = new EventSystem(app.renderer)
    events.domElement = app.renderer.view as any
    // console.log("viewportProps=>", viewportProps)
    const viewport = new Viewport({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      // events: app.renderer.events,
      events: events,
      passiveWheel: false,
      ...viewportProps,
    });
    if (viewportRef) {
      viewportRef.current = viewport;
    }
    // Activate plugins
    viewport
      .drag()
      .pinch({})
      .wheel()
      .decelerate()
      .clamp({ direction: 'all', underflow: 'center' })
      .setZoom(-10)
      // .clampZoom({
      //   minScale: props.screenWidth / props.worldWidth,
      //   maxScale: (1.04 * props.screenWidth) / (props.worldWidth / 2),
      // });
      .clampZoom({
        minScale: (1.04 * props.screenWidth) / (props.worldWidth / 2),
        maxScale: 3.0,
      });


    onClicked && viewport.on("clicked", onClicked)
    onPointerDown && viewport.on("pointerdown", onPointerDown)
    onPointerMove && viewport.on('pointermove', onPointerMove)
    onPointerUp && viewport.on("pointerup", onPointerUp)


    return viewport;
  },
  applyProps(viewport, oldProps: any, newProps: any) {
    Object.keys(newProps).forEach((p) => {
      if (p !== 'app' && p !== 'viewportRef' && p !== 'children' && oldProps[p] !== newProps[p]) {
        // @ts-expect-error Ignoring TypeScript here
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        viewport[p] = newProps[p];
      }
    });
  },
});
