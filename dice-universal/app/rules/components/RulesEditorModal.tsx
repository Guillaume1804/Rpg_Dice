// app/components/RulesEditorModal.tsx
import { ScrollView } from "react-native";
import type {
  RuleRow,
} from "../../../data/repositories/rulesRepo";
import type {
  PipelineOutput,
  PipelineStep,
  RangeRow,
} from "../hooks/useRulesEditor";

import { RulesEditorHeader } from "./RulesEditorHeader";
import { RulesEditorFooter } from "./RulesEditorFooter";
import { RulesEditorPresetsSection } from "./RulesEditorPresetsSection";
import { RulesEditorOptionsSection } from "./RulesEditorOptionsSection";
import { RulesEditorStepsSection } from "./RulesEditorStepsSection";
import { RulesEditorPreviewSection } from "./RulesEditorPreviewSection";
import { RulesEditorNameSection } from "./RulesEditorNameSection";
import { RulesEditorModalShell } from "./RulesEditorModalShell";

type Props = {
  visible: boolean;
  editingRule: RuleRow | null;

  formName: string;
  onChangeFormName: (value: string) => void;

  pipeOutput: PipelineOutput;
  onChangePipeOutput: (value: PipelineOutput) => void;

  successThreshold: string;
  onChangeSuccessThreshold: (value: string) => void;

  critSuccessFaces: string;
  onChangeCritSuccessFaces: (value: string) => void;

  critFailureFaces: string;
  onChangeCritFailureFaces: (value: string) => void;

  steps: PipelineStep[];
  keepN: string;
  onChangeKeepN: (value: string) => void;

  successAt: string;
  onChangeSuccessAt: (value: string) => void;

  takeIndex: string;
  onChangeTakeIndex: (value: string) => void;

  facesInput: string;
  onChangeFacesInput: (value: string) => void;

  rangeMin: string;
  onChangeRangeMin: (value: string) => void;

  rangeMax: string;
  onChangeRangeMax: (value: string) => void;

  ranges: RangeRow[];
  onChangeRanges: (
    updater: RangeRow[] | ((prev: RangeRow[]) => RangeRow[])
  ) => void;

  previewValues: string;
  onChangePreviewValues: (value: string) => void;

  previewSides: string;
  onChangePreviewSides: (value: string) => void;

  previewModifier: string;
  onChangePreviewModifier: (value: string) => void;

  previewSign: string;
  onChangePreviewSign: (value: string) => void;

  previewResult: string;

  toFacesArray: (input: string) => number[];

  onApplyPreset: (
    preset:
      | "SUM"
      | "D20"
      | "D100_CRIT"
      | "D100_LOC"
      | "KEEP_HIGHEST"
      | "SUCCESS_POOL"
  ) => void;

  onAddStep: (step: PipelineStep) => void;
  onRemoveStepAt: (index: number) => void;
  onMoveStepUp: (index: number) => void;
  onMoveStepDown: (index: number) => void;

  onComputePreview: () => void;
  onClose: () => void;
  onSave: () => void;
};

export function RulesEditorModal({
  visible,
  editingRule,

  formName,
  onChangeFormName,

  pipeOutput,
  onChangePipeOutput,

  successThreshold,
  onChangeSuccessThreshold,

  critSuccessFaces,
  onChangeCritSuccessFaces,

  critFailureFaces,
  onChangeCritFailureFaces,

  steps,
  keepN,
  onChangeKeepN,

  successAt,
  onChangeSuccessAt,

  takeIndex,
  onChangeTakeIndex,

  facesInput,
  onChangeFacesInput,

  rangeMin,
  onChangeRangeMin,

  rangeMax,
  onChangeRangeMax,

  ranges,
  onChangeRanges,

  previewValues,
  onChangePreviewValues,

  previewSides,
  onChangePreviewSides,

  previewModifier,
  onChangePreviewModifier,

  previewSign,
  onChangePreviewSign,

  previewResult,

  toFacesArray,

  onApplyPreset,
  onAddStep,
  onRemoveStepAt,
  onMoveStepUp,
  onMoveStepDown,

  onComputePreview,
  onClose,
  onSave,
}: Props) {
  return (
    <RulesEditorModalShell
      visible={visible}
      onClose={onClose}
    >
      <RulesEditorHeader editingRule={editingRule} />

      <ScrollView style={{ marginTop: 12 }}>
        <RulesEditorNameSection
          formName={formName}
          onChangeFormName={onChangeFormName}
        />

        <RulesEditorPresetsSection onApplyPreset={onApplyPreset} />


        <RulesEditorOptionsSection
          pipeOutput={pipeOutput}
          onChangePipeOutput={onChangePipeOutput}
          successThreshold={successThreshold}
          onChangeSuccessThreshold={onChangeSuccessThreshold}
          critSuccessFaces={critSuccessFaces}
          onChangeCritSuccessFaces={onChangeCritSuccessFaces}
          critFailureFaces={critFailureFaces}
          onChangeCritFailureFaces={onChangeCritFailureFaces}
        />

        <RulesEditorStepsSection
          steps={steps}
          onRemoveStepAt={onRemoveStepAt}
          onMoveStepUp={onMoveStepUp}
          onMoveStepDown={onMoveStepDown}
          onAddStep={onAddStep}
          keepN={keepN}
          onChangeKeepN={onChangeKeepN}
          successAt={successAt}
          onChangeSuccessAt={onChangeSuccessAt}
          takeIndex={takeIndex}
          onChangeTakeIndex={onChangeTakeIndex}
          facesInput={facesInput}
          onChangeFacesInput={onChangeFacesInput}
          rangeMin={rangeMin}
          onChangeRangeMin={onChangeRangeMin}
          rangeMax={rangeMax}
          onChangeRangeMax={onChangeRangeMax}
          ranges={ranges}
          onChangeRanges={onChangeRanges}
          toFacesArray={toFacesArray}
        />

        <RulesEditorPreviewSection
          previewValues={previewValues}
          onChangePreviewValues={onChangePreviewValues}
          previewSides={previewSides}
          onChangePreviewSides={onChangePreviewSides}
          previewModifier={previewModifier}
          onChangePreviewModifier={onChangePreviewModifier}
          previewSign={previewSign}
          onChangePreviewSign={onChangePreviewSign}
          previewResult={previewResult}
          onComputePreview={onComputePreview}
        />

      </ScrollView>

      <RulesEditorFooter onClose={onClose} onSave={onSave} />
          
    </RulesEditorModalShell>
  );
}