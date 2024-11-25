import React, { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  AccessibilityHelp,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BlockQuote,
  BlockToolbar,
  Bold,
  CloudServices,
  Code,
  CodeBlock,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  FullPage,
  GeneralHtmlSupport,
  Heading,
  HorizontalLine,
  HtmlComment,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  Paragraph,
  SelectAll,
  ShowBlocks,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Style,
  Subscript,
  Superscript,
  BalloonToolbar,
  PasteFromOffice,
  MediaEmbed,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextPartLanguage,
  TextTransformation,
  Underline,
  Undo,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import "./Ck.css";
import { EditorConfig } from "@ckeditor/ckeditor5-core";
// TypeScript typing cho các tham chiếu DOM
const CkEditorComponent: React.FC<{
  onChange: (data: string) => void;
  data: string;
  placeholder?: string;
}> = ({ onChange, data, placeholder }) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLayoutReady, setIsLayoutReady] = useState<boolean>(false);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  // Import kiểu EditorConfig

  const editorConfig: EditorConfig = {
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "textPartLanguage",
        "|",
        "heading",
        "style",
        "|",
        "bold",
        "italic",
        "underline",
        "|",
        "horizontalLine",
        "link",
        "mediaEmbed",
        "insertTable",
        "blockQuote",
        "codeBlock",
        "|",
        "alignment",
        "|",
        "outdent",
        "indent",
      ],
      shouldNotGroupWhenFull: false,
    },
    plugins: [
      AccessibilityHelp,
      Alignment,
      Autoformat,
      AutoImage,
      AutoLink,
      Autosave,
      BlockQuote,
      BlockToolbar,
      Bold,
      CloudServices,
      Code,
      CodeBlock,
      Essentials,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      FullPage,
      GeneralHtmlSupport,
      Heading,
      HorizontalLine,
      HtmlComment,
      HtmlEmbed,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      Paragraph,
      SelectAll,
      BalloonToolbar,
      PasteFromOffice,
      MediaEmbed,
      ShowBlocks,
      SourceEditing,
      SpecialCharacters,
      SpecialCharactersArrows,
      SpecialCharactersCurrency,
      SpecialCharactersEssentials,
      SpecialCharactersLatin,
      SpecialCharactersMathematical,
      SpecialCharactersText,
      Strikethrough,
      Style,
      Subscript,
      Superscript,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextPartLanguage,
      TextTransformation,
      Underline,
      Undo,
    ],
    placeholder: placeholder ? placeholder : "Nhập nội dung tại đây...",
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "tableProperties",
        "tableCellProperties",
      ],
    },
  };

  return (
    <div>
      <div className="main-container">
        <div
          className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-block-toolbar"
          ref={editorContainerRef}
        >
          <div className="editor-container__editor">
            <div ref={editorRef}>
              {isLayoutReady && (
                <CKEditor
                  editor={ClassicEditor}
                  config={editorConfig}
                  data={data}
                  onChange={(event, editor) => {
                    console.log(event);
                    onChange(editor.getData());
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CkEditorComponent;
