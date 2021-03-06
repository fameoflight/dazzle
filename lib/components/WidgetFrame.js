import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';
import { WIDGET } from './ItemTypes';
import { removeWidget, sortWidget } from '../util';
import DefaultFrame from './DefaultFrame';
import { isValidDate } from '../util';

const boxSource = {
  beginDrag(props) {
    return {
      widgetName: props.widgetName,
      rowIndex: props.rowIndex,
      columnIndex: props.columnIndex,
      widgetIndex: props.widgetIndex,
      title: props.title,
      props,
    };
  },
};

const cardTarget = {
  hover(props, monitor, component) {
    const curItem = monitor.getItem();

    const dragIndex = curItem.widgetIndex;
    const hoverIndex = props.widgetIndex;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    const { layout, columnIndex, rowIndex } = props;
    if (curItem.columnIndex === columnIndex) {
      const newLayout = sortWidget(layout, {
        rowIndex,
        columnIndex,
        widgetIndex: dragIndex,
      },
        {
          rowIndex,
          columnIndex,
          widgetIndex: hoverIndex,
        }, ...curItem);
      props.onMove(newLayout);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      curItem.widgetIndex = hoverIndex; // eslint-disable-line no-param-reassign
    }
  },
};

/**
 * Frame component which surrounds each widget.
 */
@DropTarget(WIDGET, cardTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))
@DragSource(WIDGET, boxSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))
class WidgetFrame extends Component {
  render() {
    const {
      frameComponent,
      children,
      editable,
      title,
      frameSettings,
      connectDragSource,
      connectDropTarget,
      isDragging,
      rowIndex,
      columnIndex,
      widgetIndex,
    } = this.props;

    const titlecomp = title;
    let titleSet = title;
    const type = typeof titlecomp;
    const isSimpleType = (type === 'string'
      || type === 'boolean'
      || type === 'number'
      || (type === 'object' && isValidDate(titlecomp)) // 'date'
      || type === 'undefined'
      || type === 'symbol');
    if (!isSimpleType) {
      titleSet = titlecomp({ container: this.props.widget, ...this.props });
    }
    let selected = null;
    const compProps = { children, editable, title: titleSet, onRemove: this.remove, rowIndex, columnIndex, widgetIndex };
    if (frameComponent) {
      // if user provided a custom frame,  use it
      selected = createElement(frameComponent, { ...compProps }); // eslint-disable-line max-len
    } else {
      // else use the default frame
      selected = (
        <DefaultFrame {...compProps} />
      );
    }
    const opacity = isDragging ? 0 : 1;
    const widgetFrame = (
      <div style={{ opacity }}>
        {selected}
      </div>
    );

    return editable ? connectDragSource(connectDropTarget(widgetFrame)) : widgetFrame;
  }

  remove = () => {
    const { layout, rowIndex, columnIndex, widgetIndex } = this.props;
    const newLayout = removeWidget(layout, rowIndex, columnIndex, widgetIndex);
    this.props.onRemove(newLayout, rowIndex, columnIndex, widgetIndex);
  }
}

WidgetFrame.propTypes = {
  /**
   * Childrens of the widget frame.
   */
  children: PropTypes.element,


  /**
   * Layout of the dahsboard.
   */
  layout: PropTypes.object,

  /**
   * Index of the column these widgets should be placed.
   */
  columnIndex: PropTypes.number,

  /**
   * Index of the row these widgets should be placed.
   */
  rowIndex: PropTypes.number,

  /**
   * Index of the widget.
   */
  widgetIndex: PropTypes.number,

  /**
   * Indicates weatehr dashboard is in ediable mode or not.
   */
  editable: PropTypes.bool,

  /**
   * User provided widget frame that should be used instead of the default one.
   */
  frameComponent: PropTypes.func,

  /**
   * User provided settings for be use by custom widget frame.
   */
  frameSettings: PropTypes.object,

  /**
   * Name of the widget.
   */
  widgetName: PropTypes.string,

  /**
   * Title of the widget.
   */
  title: PropTypes.oneOfType([PropTypes.bool, PropTypes.element, PropTypes.func, PropTypes.number, PropTypes.object, PropTypes.string, PropTypes.symbol, PropTypes.array]),

  /**
   * Weather the component is being dragged.
   */
  isDragging: PropTypes.bool,

  /**
   * ReactDnd's connectDragSource().
   */
  connectDragSource: PropTypes.func,

  /**
   * ReactDnd's connectDropTarget().
   */
  connectDropTarget: PropTypes.func,

  /**
   * Function that should be called when a widget is about to be removed.
   */
  onRemove: PropTypes.func,
};

WidgetFrame.defaultProps = {
  frameSettings: {},
};

export default WidgetFrame;
