import React, { createElement } from 'react';
import PropTypes from 'prop-types';
import WidgetFrame from './WidgetFrame';

/**
 * Component that renders the widget which belongs to a column.
 */
/* eslint max-len: "off" */
const Widgets = ({ widgets, widgetTypes, onRemove, layout, columnIndex, rowIndex, editable, frameComponent, onMove }) => {
  let createdWidgets = widgets.map((widget, index) => { // eslint-disable-line arrow-body-style
    const widgetType = widgetTypes[widget.key];
    const propsFromWidgetTypes = widgetType.props || {};
    const propsFromWidget = widget.props || {};
    const props = { ...propsFromWidgetTypes, ...propsFromWidget };
    const titlecomp = widget.title || widgetType.title;

    return (
      <WidgetFrame
        key={index}
        widgetName={widget.key}
        title={titlecomp}
        onRemove={onRemove}
        layout={layout}
        columnIndex={columnIndex}
        rowIndex={rowIndex}
        widgetIndex={index}
        editable={editable}
        frameComponent={frameComponent}
        frameSettings={widgetTypes[widget.key].frameSettings}
        onMove={onMove}
        widget={widget}
      >
        {
          createElement(widgetTypes[widget.key].type, { columnIndex, rowIndex, widgetIndex: index, ...props })
        }
      </WidgetFrame>
    );
  });
  return <div>{createdWidgets}</div>;
};

Widgets.propTypes = {
  /**
   * Widgets that should be rendered.
   */
  widgets: PropTypes.array,

  /**
   * Widgets that are available in the dashboard.
   */
  widgetTypes: PropTypes.object,

  /**
   * Function that should be called when a widget is about to be removed.
   */
  onRemove: PropTypes.func,

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
   * Indicates weatehr dashboard is in ediable mode or not.
   */
  editable: PropTypes.bool,

  /**
   * User provided widget frame that should be used instead of the default one.
   */
  frameComponent: PropTypes.func,

  /**
   * Method to call when a widget is moved.
   */
  onMove: PropTypes.func,
};

export default Widgets;
