/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import * as ko from "knockout";
import { IViewManager, ViewManagerMode } from "@paperbits/common/ui";
import { LayoutModelBinder } from "../../layout/layoutModelBinder";
import { GridHelper } from "@paperbits/common/editing";
import { IEventManager } from "@paperbits/common/events";
import { GridEditor } from "@paperbits/core/grid/ko/gridEditor";
import { IWidgetService } from "@paperbits/common/widgets";

export class EmailGridBindingHandler {
    constructor(
        viewManager: IViewManager,
        eventManager: IEventManager,
        emailLayoutModelBinder: LayoutModelBinder,
        widgetService: IWidgetService,
        gridEditor: GridEditor
    ) {
        ko.bindingHandlers["email-grid"] = {
            init(gridElement: HTMLElement) {
                // TODO: Replace active observer with some reactive logic.
                const observer = new MutationObserver(mutations => {
                    if (viewManager.mode === ViewManagerMode.dragging) {
                        return;
                    }

                    const layoutModel = GridHelper.getModel(gridElement);
                    emailLayoutModelBinder.updateContent(layoutModel);
                });

                observer.observe(gridElement, {
                    attributes: true,
                    childList: true,
                    characterData: true,
                    subtree: true
                });

                ko.utils.domNodeDisposal.addDisposeCallback(gridElement, () => {
                    gridEditor.detach();
                    observer.disconnect();
                });

                gridEditor.attach(gridElement.ownerDocument);
            }
        };

        ko.bindingHandlers["layoutsection"] = {
            init(sourceElement: HTMLElement) {
                EmailGridBindingHandler.attachSectionDragEvents(sourceElement, viewManager, eventManager, widgetService);
            }
        }

        ko.bindingHandlers["layoutcolumn"] = {
            init(sourceElement: HTMLElement) {
                EmailGridBindingHandler.attachColumnDragEvents(sourceElement, viewManager, eventManager, widgetService);
            }
        }
    }

    public static attachSectionDragEvents(sourceElement: HTMLElement, viewManager: IViewManager, eventManager: IEventManager, widgetService: IWidgetService): void {
        const onDragStart = (item): HTMLElement => {
            const placeholderWidth = sourceElement.clientWidth - 1 + "px";
            const placeholderHeight = sourceElement.clientHeight - 1 + "px";

            const sourceBinding = GridHelper.getWidgetBinding(sourceElement);
            const sourceModel = GridHelper.getModel(sourceElement);
            const sourceParentElement = GridHelper.getParentElementWithModel(sourceElement);
            const parentModel = GridHelper.getModel(sourceParentElement);
            const parentBinding = GridHelper.getWidgetBinding(sourceParentElement);
            const placeholderElement = sourceElement.ownerDocument.createElement("div");

            placeholderElement.style.height = placeholderHeight;
            placeholderElement.style.width = placeholderWidth;
            placeholderElement.classList.add("placeholder");

            sourceElement.parentNode.insertBefore(placeholderElement, sourceElement.nextSibling);

            viewManager.beginDrag({
                type: "section",
                sourceElement: sourceElement,
                sourceModel: sourceModel,
                sourceBinding: sourceBinding,
                parentModel: parentModel,
                parentBinding: parentBinding
            });

            return sourceElement;
        };

        const onDragEnd = () => {
            const dragSession = viewManager.getDragSession();
            const parentBinding = dragSession.parentBinding;
            const acceptorElement = dragSession.targetElement;
            const acceptorBinding = dragSession.targetBinding;

            if (acceptorElement) {
                const parentModel = <any>dragSession.parentModel;
                const model = dragSession.sourceModel;
                parentModel.widgets.remove(model); // TODO: Replace "sections" with "children".
            }

            parentBinding.applyChanges();

            if (acceptorBinding && acceptorBinding.handler) {
                const widgetHandler = widgetService.getWidgetHandler(acceptorBinding.handler);
                widgetHandler.onDragDrop(dragSession);
            }

            eventManager.dispatchEvent("virtualDragEnd");
        };

        const preventDragging = (): boolean => {
            return viewManager.mode === ViewManagerMode.configure;
        };

        ko.applyBindingsToNode(sourceElement, {
            dragsource: { sticky: true, ondragstart: onDragStart, ondragend: onDragEnd, preventDragging: preventDragging }
        });
    }

    public static attachRowDragEvents(sourceElement: HTMLElement, viewManager: IViewManager, eventManager: IEventManager, widgetService: IWidgetService): void {
        const onDragStart = (): HTMLElement => {
            const placeholderWidth = sourceElement.clientWidth - 1 + "px";
            const placeholderHeight = sourceElement.clientHeight - 1 + "px";

            const sourceBinding = GridHelper.getWidgetBinding(sourceElement);
            const sourceModel = GridHelper.getModel(sourceElement);
            const sourceParentElement = GridHelper.getParentElementWithModel(sourceElement);
            const parentModel = GridHelper.getModel(sourceParentElement);
            const parentBinding = GridHelper.getWidgetBinding(sourceParentElement);

            const placeholderElement = sourceElement.ownerDocument.createElement("div");
            placeholderElement.style.height = placeholderHeight;
            placeholderElement.style.width = placeholderWidth;
            placeholderElement.classList.add("placeholder");

            sourceElement.parentNode.insertBefore(placeholderElement, sourceElement.nextSibling);

            viewManager.beginDrag({
                type: "row",
                sourceElement: sourceElement,
                sourceModel: sourceModel,
                sourceBinding: sourceBinding,
                parentModel: parentModel,
                parentBinding: parentBinding
            });

            return sourceElement;
        };

        const onDragEnd = () => {
            const dragSession = viewManager.getDragSession();
            const parentBinding = dragSession.parentBinding;
            const acceptorElement = dragSession.targetElement;
            const acceptorBinding = dragSession.targetBinding;

            if (acceptorElement) {
                const parentModel = <any>dragSession.parentModel;
                const model = <any>dragSession.sourceModel;

                parentModel.widgets.remove(model);
            }

            parentBinding.applyChanges();

            if (acceptorBinding && acceptorBinding.handler) {
                const widgetHandler = widgetService.getWidgetHandler(acceptorBinding.handler);
                widgetHandler.onDragDrop(dragSession);
            }

            eventManager.dispatchEvent("virtualDragEnd");
        };

        const preventDragging = (): boolean => {
            return viewManager.mode === ViewManagerMode.configure;
        };

        ko.applyBindingsToNode(sourceElement, {
            dragsource: { sticky: true, ondragstart: onDragStart, ondragend: onDragEnd, preventDragging: preventDragging }
        });
    }

    public static attachColumnDragEvents(sourceElement: HTMLElement, viewManager: IViewManager, eventManager: IEventManager, widgetService: IWidgetService): void {
        const onDragStart = (): HTMLElement => {
            const placeholderWidth = sourceElement.clientWidth - 1 + "px";
            const placeholderHeight = sourceElement.clientHeight - 1 + "px";

            const sourceBinding = GridHelper.getWidgetBinding(sourceElement);
            const sourceModel = GridHelper.getModel(sourceElement);
            const sourceParentElement = GridHelper.getParentElementWithModel(sourceElement);
            const parentModel = GridHelper.getModel(sourceParentElement);
            const parentBinding = GridHelper.getWidgetBinding(sourceParentElement);

            const placeholderElement = sourceElement.ownerDocument.createElement("div");
            placeholderElement.style.height = placeholderHeight;
            placeholderElement.style.width = placeholderWidth;
            placeholderElement.classList.add("placeholder");

            sourceElement.parentNode.insertBefore(placeholderElement, sourceElement.nextSibling);

            viewManager.beginDrag({
                type: "column",
                sourceElement: sourceElement,
                sourceModel: sourceModel,
                sourceBinding: sourceBinding,
                parentModel: parentModel,
                parentBinding: parentBinding
            });

            return sourceElement;
        };

        const onDragEnd = () => {
            const dragSession = viewManager.getDragSession();
            const parentBinding = dragSession.parentBinding;
            const acceptorElement = dragSession.targetElement;
            const acceptorBinding = dragSession.targetBinding;

            if (acceptorElement) {
                const parentModel = <any>dragSession.parentModel;
                const model = <any>dragSession.sourceModel;

                parentModel.widgets.remove(model);
            }

            parentBinding.applyChanges();

            if (acceptorBinding && acceptorBinding.handler) {
                const widgetHandler = widgetService.getWidgetHandler(acceptorBinding.handler);
                widgetHandler.onDragDrop(dragSession);
            }

            eventManager.dispatchEvent("virtualDragEnd");
        };

        const preventDragging = (): boolean => {
            return viewManager.mode === ViewManagerMode.configure;
        };

        ko.applyBindingsToNode(sourceElement, {
            dragsource: { sticky: true, ondragstart: onDragStart, ondragend: onDragEnd, preventDragging: preventDragging }
        });
    }

    public static attachWidgetDragEvents(sourceElement: HTMLElement, viewManager: IViewManager, eventManager: IEventManager, widgetService: IWidgetService): void {
        const onDragStart = (item): HTMLElement => {
            if (viewManager.mode === ViewManagerMode.configure) {
                return;
            }

            const placeholderWidth = sourceElement.clientWidth - 1 + "px";
            const placeholderHeight = sourceElement.clientHeight - 1 + "px";

            const sourceBinding = GridHelper.getWidgetBinding(sourceElement);
            const sourceModel = GridHelper.getModel(sourceElement);
            const sourceParentElement = GridHelper.getParentElementWithModel(sourceElement);
            const parentModel = GridHelper.getModel(sourceParentElement);
            const parentBinding = GridHelper.getWidgetBinding(sourceParentElement);

            const placeholderElement = sourceElement.ownerDocument.createElement("div");
            placeholderElement.style.height = placeholderHeight;
            placeholderElement.style.width = placeholderWidth;
            placeholderElement.classList.add("placeholder");

            sourceElement.parentNode.insertBefore(placeholderElement, sourceElement.nextSibling);

            viewManager.beginDrag({
                type: "widget",
                sourceElement: sourceElement,
                sourceModel: sourceModel,
                sourceBinding: sourceBinding,
                parentModel: parentModel,
                parentBinding: parentBinding,
            });

            return sourceElement;
        };

        const onDragEnd = () => {
            const dragSession = viewManager.getDragSession();
            const parentBinding = dragSession.parentBinding;
            const acceptorElement = dragSession.targetElement;
            const acceptorBinding = dragSession.targetBinding;

            if (acceptorElement) {
                const parentModel = <any>dragSession.parentModel;
                const model = dragSession.sourceModel;

                parentModel.widgets.remove(model); // replace widgets with "children"
            }

            parentBinding.applyChanges();

            if (acceptorBinding && acceptorBinding.handler) {
                const widgetHandler = widgetService.getWidgetHandler(acceptorBinding.handler);
                widgetHandler.onDragDrop(dragSession);
            }

            eventManager.dispatchEvent("virtualDragEnd");
        };

        const preventDragging = (): boolean => {
            return viewManager.mode === ViewManagerMode.configure;
        };

        ko.applyBindingsToNode(sourceElement, {
            dragsource: { sticky: true, ondragstart: onDragStart, ondragend: onDragEnd, preventDragging: preventDragging }
        });
    }
}
