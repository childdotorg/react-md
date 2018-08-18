import * as React from "react";
import * as PropTypes from "prop-types";
import { ITreeViewBaseProps } from "./TreeView";

import { onItemSelect, onItemExpandedChange, onItemSiblingExpansion, TreeViewDataList, IIndexKeyAny } from "./types";
import { handleSingleItemSelect, handleItemExpandedChange, findAllParentIds } from "./utils";

export interface ITreeViewControls<D, R> extends ITreeViewBaseProps<D, R> {
  onItemSelect: onItemSelect;
  onItemExpandedChange: onItemExpandedChange;
  onItemSiblingExpansion: onItemSiblingExpansion;
  selectedIds: string[];
  expandedIds: string[];
}

export interface ITreeViewControlsProps<D, R> extends ITreeViewBaseProps<D, R> {
  /**
   * An optional list of item ids that are selected when the `TreeViewControls` component mounts. If
   * this list is empty, the first item within the provided `data` set will be used instead since
   * the tree will not be keyboard focusable without a selected element.
   *
   * @docgen
   */
  defaultSelectedIds?: string[];

  /**
   * An optional list of item ids that are expanded when the `TreeViewControls` component mounts. If
   * this list is empty and there are items in the `defaultSelectedIds` list, the component will
   * traverse the `data` set and find all parent ids for each id in the `defaultSelectedIds` list so
   * that the selected items will be visible by default.
   *
   * @docgen
   */
  defaultExpandedIds?: string[];

  /**
   * A callback function that will provide all the required item listeners and item id lists to the
   * `TreeView` component as well as any other prop that was passed to the `TreeViewControls` component.
   *
   * @docgen
   */
  children: (controls: ITreeViewControls<D, R>) => React.ReactNode;
}

export interface ITreeViewControlsDefaultProps {
  defaultSelectedIds: string[];
  defaultExpandedIds: string[];
}

export type TreeViewControlsWithDefaultProps<D, R> = ITreeViewControlsProps<D, R> & ITreeViewControlsDefaultProps;

export interface ITreeViewControlsState {
  selectedIds: string[];
  expandedIds: string[];
}

/**
 * The `TreeViewControls` component is used as a simple higher order component to add the basic selection and
 * expansion event handlers and state to the `TreeView` component.
 */
export default class TreeViewControls<D, R> extends React.Component<
  ITreeViewControlsProps<D, R>,
  ITreeViewControlsState
> {
  public static propTypes = {
    className: PropTypes.string,
    defaultSelectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    defaultExpandedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  public static defaultProps: ITreeViewControlsDefaultProps = {
    defaultSelectedIds: [],
    defaultExpandedIds: [],
  };

  constructor(props: ITreeViewControlsProps<D, R>) {
    super(props);
    const { data, defaultExpandedIds, defaultSelectedIds } = props as TreeViewControlsWithDefaultProps<D, R>;

    let selectedIds = defaultSelectedIds;
    let expandedIds = defaultExpandedIds;
    if (!expandedIds.length && selectedIds.length) {
      expandedIds = findAllParentIds(data, selectedIds);
    }

    if (!selectedIds.length && data[0] && data[0].itemId) {
      selectedIds = [data[0].itemId];
    }

    this.state = {
      selectedIds,
      expandedIds,
    };
  }

  public render() {
    const { selectedIds, expandedIds } = this.state;
    const {
      defaultSelectedIds,
      defaultExpandedIds,
      onItemSelect,
      onItemExpandedChange,
      onItemSiblingExpansion,
      children,
      ...props
    } = this.props;

    return children({
      ...props,
      selectedIds,
      expandedIds,
      onItemSelect: this.handleItemSelect,
      onItemExpandedChange: this.handleItemExpandedChange,
      onItemSiblingExpansion: this.handleItemSiblingExpansion,
    });
  }

  private handleItemSelect = (itemId: string) => {
    const selectedIds = handleSingleItemSelect(itemId, this.state.selectedIds);
    if (this.state.selectedIds !== selectedIds) {
      this.setState({ selectedIds });
    }
  };

  private handleItemExpandedChange = (itemId: string, expanded: boolean) => {
    const expandedIds = handleItemExpandedChange(itemId, expanded, this.state.expandedIds);
    if (this.state.expandedIds !== expandedIds) {
      this.setState({ expandedIds });
    }
  };

  private handleItemSiblingExpansion = (expandedIds: string[]) => {
    this.setState({ expandedIds });
  };
}
