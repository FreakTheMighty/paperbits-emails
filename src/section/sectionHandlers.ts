import { IContextCommandSet, IView, IViewManager } from "@paperbits/common/ui";
import { DragSession } from "@paperbits/common/ui/draggables";
import { WidgetContext } from "@paperbits/common/editing";
import { SectionModel } from "./sectionModel";
import { RowModel } from "../row/rowModel";


export class SectionHandlers {
    constructor(private readonly viewManager: IViewManager) { }

    public onDragOver(dragSession: DragSession): boolean {
        return dragSession.type === "row";
    }

    public onDragDrop(dragSession: DragSession): void {
        switch (dragSession.type) {
            case "row":
                dragSession.targetBinding.model.widgets.splice(dragSession.insertIndex, 0, dragSession.sourceModel);
                break;

            default:
                throw new Error(`Unknown type: ${dragSession.type}`);
        }
        dragSession.targetBinding.applyChanges();
    }

    public getContextualEditor(context: WidgetContext): IContextCommandSet {
        const sectionContextualEditor: IContextCommandSet = {
            color: "#2b87da",
            hoverCommand: {
                position: context.half,
                tooltip: "Add section",
                color: "#2b87da",
                component: {
                    name: "email-section-layout-selector",
                    params: {
                        onSelect: (newSectionModel: SectionModel) => {
                            const sectionHalf = context.half;

                            let index = context.parentModel.widgets.indexOf(context.model);

                            if (sectionHalf === "bottom") {
                                index++;
                            }

                            context.parentModel.widgets.splice(index, 0, newSectionModel);
                            context.parentBinding.applyChanges();

                            this.viewManager.clearContextualEditors();
                        }
                    }
                }
            },
            deleteCommand: {
                tooltip: "Delete section",
                color: "#2b87da",
                callback: () => {
                    context.parentModel.widgets.remove(context.model);
                    context.parentBinding.applyChanges();

                    this.viewManager.clearContextualEditors();
                }
            },
            selectionCommands: [{
                tooltip: "Edit section",
                iconClass: "paperbits-edit-72",
                position: "top right",
                color: "#2b87da",
                callback: () => this.viewManager.openWidgetEditor(context.binding)
            },
            {
                tooltip: "Add to library",
                iconClass: "paperbits-simple-add",
                position: "top right",
                color: "#2b87da",
                callback: () => {
                    const view: IView = {
                        heading: "Add to library",
                        component: {
                            name: "add-block-dialog",
                            params: context.model
                        },
                        resize: "vertically horizontally"
                    };

                    this.viewManager.openViewAsPopup(view);
                }
            }]
        };


        if (context.model.widgets.length === 0) {
            sectionContextualEditor.hoverCommand = {
                position: "center",
                tooltip: "Add row",
                color: "#29c4a9",
                component: {
                    name: "email-row-layout-selector",
                    params: {
                        onSelect: (newRowModel: RowModel) => {
                            context.model.widgets.push(newRowModel);
                            context.binding.applyChanges();

                            this.viewManager.clearContextualEditors();
                        }
                    }
                }
            };
        }

        return sectionContextualEditor;
    }
}