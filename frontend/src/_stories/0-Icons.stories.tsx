import React from "react";
import { Box, BoxProps, WithStyles, Theme, createStyles, withStyles, Typography } from "@material-ui/core";
import { primaryColor } from "theme/theme";
import { color, select } from "@storybook/addon-knobs";
import * as icons from "widgets/Icon";
import { storiesOf } from "@storybook/react";
import { Caption } from "widgets/Label";

export default {
  title: "Design System/Icons",
  component: icons,
};

const Size = [24, 26, 30, 32];

const wrapper = (child: React.ReactNode, title: string) => {
  return (
    <>
      <div
        style={{
          margin: 4,
          marginTop: 12,
          marginBottom: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 120,
        }}
      >
        {child}
        <Caption>{title}</Caption>
      </div>
    </>
  );
};

storiesOf("Design System/Icons", module).add("Icon", () => {
  const fill = color("Fill", "#000000", "Icons");
  const size = select("size", Size, Size[0], "Icons");
  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", margin: 10, flexWrap: "wrap" }}>
      {wrapper(<icons.AddFileIcon style={{ color: fill, fontSize: size }} />, "AddFileIcon")}
      {wrapper(<icons.AddFolderIcon style={{ color: fill, fontSize: size }} />, "AddFolderIcon")}
      {wrapper(<icons.ArrowBackIcon style={{ color: fill, fontSize: size }} />, "ArrowBackIcon")}
      {wrapper(<icons.ArrowDropDownIcon style={{ color: fill, fontSize: size }} />, "ArrowDropDownIcon")}
      {wrapper(<icons.CheckBoxIcon style={{ color: fill, fontSize: size }} />, "CheckBoxIcon")}
      {wrapper(<icons.CheckBoxOutlineBlankIcon style={{ color: fill, fontSize: size }} />, "CheckBoxOutlineBlankIcon")}
      {wrapper(<icons.CheckCircleIcon style={{ color: fill, fontSize: size }} />, "CheckCircleIcon")}
      {wrapper(<icons.ClearIcon style={{ color: fill, fontSize: size }} />, "ClearIcon")}
      {wrapper(<icons.CopyIcon style={{ color: fill, fontSize: size }} />, "CopyIcon")}
      {wrapper(<icons.DeleteIcon style={{ color: fill, fontSize: size }} />, "DeleteIcon")}
      {wrapper(<icons.EditIcon style={{ color: fill, fontSize: size }} />, "EditIcon")}
      {wrapper(<icons.ErrorIcon style={{ color: fill, fontSize: size }} />, "ErrorIcon")}
      {wrapper(<icons.FilterListIcon style={{ color: fill, fontSize: size }} />, "FilterListIcon")}
      {wrapper(<icons.HelpIcon style={{ color: fill, fontSize: size }} />, "HelpIcon")}
      {wrapper(<icons.KappApplicationIcon style={{ color: fill, fontSize: size }} />, "KappApplicationIcon")}
      {wrapper(<icons.KappConsoleIcon style={{ color: fill, fontSize: size }} />, "KappConsoleIcon")}
      {wrapper(<icons.KappLogIcon style={{ color: fill, fontSize: size }} />, "KappLogIcon")}
      {wrapper(<icons.KappNodeIcon style={{ color: fill, fontSize: size }} />, "KappNodeIcon")}
      {wrapper(<icons.KappTemplateIcon style={{ color: fill, fontSize: size }} />, "KappTemplateIcon")}
      {wrapper(<icons.KappVolumeIcon style={{ color: fill, fontSize: size }} />, "KappVolumeIcon")}
      {wrapper(<icons.UploadIcon style={{ color: fill, fontSize: size }} />, "UploadIcon")}
      {wrapper(<icons.KappDetailsIcon style={{ color: fill, fontSize: size }} />, "KappDetailsIcon")}
      {wrapper(<icons.KappCertificatesIcon style={{ color: fill, fontSize: size }} />, "KappCertificatesIcon")}
      {wrapper(<icons.KappRegistryIcon style={{ color: fill, fontSize: size }} />, "KappRegistryIcon")}
    </div>
  );
});
