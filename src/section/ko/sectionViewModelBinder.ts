/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by a Commercial license that can be found in the LICENSE file and at https://paperbits.io/license.
 */

import { SectionViewModel } from "./sectionViewModel";
import { IViewModelBinder } from "@paperbits/common/widgets";
import { IContextualEditor, IView, IViewManager } from "@paperbits/common/ui";
import { GridHelper, IWidgetBinding } from "@paperbits/common/editing";
import { SectionModel } from "../sectionModel";
import { RowModel } from "../../row/rowModel";
import { PlaceholderViewModel } from "@paperbits/core/placeholder/ko";
import { ViewModelBinderSelector } from "@paperbits/core/ko/viewModelBinderSelector";

export class SectionViewModelBinder implements IViewModelBinder<SectionModel, SectionViewModel> {
    constructor(
        private readonly viewModelBinderSelector: ViewModelBinderSelector,
        private readonly viewManager: IViewManager
    ) { }

    public modelToViewModel(model: SectionModel, readonly: boolean, viewModel?: SectionViewModel): SectionViewModel {
        if (!viewModel) {
            viewModel = new SectionViewModel();
        }

        const viewModels = model.widgets
            .map(widgetModel => {
                const viewModelBinder = this.viewModelBinderSelector.getViewModelBinderByModel(widgetModel);
                const viewModel = viewModelBinder.modelToViewModel(widgetModel, readonly);

                return viewModel;
            });

        if (viewModels.length === 0) {
            viewModels.push(<any>new PlaceholderViewModel("Section"));
        }

        viewModel.widgets(viewModels);
        viewModel.container(model.container);
        viewModel.background(model.background);
        viewModel.snapTo(model.snap);

        const binding: IWidgetBinding = {
            name: "section",
            displayName: "Section",
            readonly: readonly,
            model: model,
            flow: "block",
            editor: "email-section-editor",
            applyChanges: () => {
                this.modelToViewModel(model, readonly, viewModel);
            },

            getContextualEditor: (element: HTMLElement, half: string, placeholderElement?: HTMLElement, placeholderHalf?: string): IContextualEditor => {
                const sectionContextualEditor: IContextualEditor = {
                    element: element,
                    color: "#2b87da",
                    hoverCommand: {
                        position: half,
                        tooltip: "Add section",
                        color: "#2b87da",
                        component: {
                            name: "email-section-layout-selector",
                            params: {
                                onSelect: (newSectionModel: SectionModel) => {
                                    let sectionElement = element;
                                    let sectionHalf = half;

                                    if (!sectionElement) {
                                        sectionElement = placeholderElement;
                                    }

                                    if (!sectionHalf) {
                                        sectionHalf = placeholderHalf;
                                    }

                                    const mainElement = GridHelper.getParentElementWithModel(sectionElement);
                                    const mainModel = GridHelper.getModel(mainElement);
                                    const mainWidgetModel = GridHelper.getWidgetBinding(mainElement);
                                    const sectionModel = <SectionModel>GridHelper.getModel(sectionElement);
                                    let index = mainModel.widgets.indexOf(sectionModel);

                                    if (sectionHalf === "bottom") {
                                        index++;
                                    }

                                    mainModel.widgets.splice(index, 0, newSectionModel);
                                    mainWidgetModel.applyChanges();

                                    this.viewManager.clearContextualEditors();
                                }
                            }
                        }
                    },
                    deleteCommand: {
                        tooltip: "Delete section",
                        color: "#2b87da",
                        callback: () => {
                            const mainElement = GridHelper.getParentElementWithModel(element);
                            const mainModel = GridHelper.getModel(mainElement);
                            const mainWidgetModel = GridHelper.getWidgetBinding(mainElement);
                            const sectionModel = GridHelper.getModel(element);

                            mainModel.widgets.remove(sectionModel);
                            mainWidgetModel.applyChanges();

                            this.viewManager.clearContextualEditors();
                        }
                    },
                    selectionCommands: [{
                        tooltip: "Edit section",
                        iconClass: "paperbits-edit-72",
                        position: "top right",
                        color: "#2b87da",
                        callback: () => {
                            const binding = GridHelper.getWidgetBinding(element);
                            this.viewManager.openWidgetEditor(binding);
                        }
                    },
                    {
                        tooltip: "Add to library",
                        iconClass: "paperbits-simple-add",
                        position: "top right",
                        color: "#2b87da",
                        callback: () => {
                            const view: IView = {
                                component: {
                                    name: "add-block-dialog",
                                    params: GridHelper.getModel(element)
                                },
                                resize: "vertically horizontally"
                            };

                            this.viewManager.openViewAsPopup(view);
                        }
                    }]
                };

                const attachedModel = <SectionModel>GridHelper.getModel(element);

                if (attachedModel.widgets.length === 0) {
                    sectionContextualEditor.hoverCommand = {
                        position: "center",
                        tooltip: "Add row",
                        color: "#29c4a9",
                        component: {
                            name: "email-row-layout-selector",
                            params: {
                                onSelect: (newRowModel: RowModel) => {
                                    const sectionModel = GridHelper.getModel(element);
                                    const sectionBinding = GridHelper.getWidgetBinding(element);

                                    sectionModel.widgets.push(newRowModel);
                                    sectionBinding.applyChanges();

                                    this.viewManager.clearContextualEditors();
                                }
                            }
                        }
                    }
                }

                return sectionContextualEditor;
            }
        };

        viewModel["widgetBinding"] = binding;

        return viewModel;
    }

    public canHandleModel(model: SectionModel): boolean {
        return model instanceof SectionModel;
    }
}