"use client";

import { Effect } from "effect";
import { useMemo } from "react";
import { EffectExample } from "@/components/display";
import { TemperatureResult } from "@/components/renderers";
import { useVisualEffect } from "@/hooks/useVisualEffects";
import type { ExampleComponentProps } from "@/lib/example-types";
import { VisualEffect } from "@/VisualEffect";
import { getDelay } from "./helpers";

function fetchWeatherFromSource(
  temperature: number,
  sourceName: string,
  minDelay: number,
  maxDelay: number
) {
  return Effect.gen(function* () {
    const delay = getDelay(minDelay, maxDelay);
    yield* Effect.sleep(delay);

    if (Math.random() < 0.4) {
      return new TemperatureResult(temperature, sourceName);
    }
    return yield* Effect.fail(`${sourceName} Down`);
  });
}

export function EffectFirstSuccessOfExample({
  exampleId,
  index,
  metadata,
}: ExampleComponentProps) {
  const weatherAPI = useVisualEffect("weatherAPI", () =>
    fetchWeatherFromSource(72, "Weather API", 300, 600)
  );

  const localSensor = useVisualEffect("localSensor", () =>
    fetchWeatherFromSource(73, "Local Sensor", 400, 700)
  );

  const backupService = useVisualEffect("backupService", () =>
    fetchWeatherFromSource(74, "Backup Service", 500, 800)
  );

  const firstSuccessOfTask = useMemo(() => {
    const firstSuccessOf = Effect.firstSuccessOf([
      weatherAPI.effect,
      localSensor.effect,
      backupService.effect,
    ]);

    return new VisualEffect("result", firstSuccessOf);
  }, [weatherAPI, localSensor, backupService]);

  const codeSnippet = `
const weatherAPI = fetchFromWeatherAPI();
const localSensor = fetchFromLocalSensor();
const backupService = fetchFromBackupService();

const result = Effect.firstSuccessOf([
  weatherAPI,
  localSensor,
  backupService
]);
  `;

  const taskHighlightMap = useMemo(
    () => ({
      weatherAPI: { text: "fetchFromWeatherAPI()" },
      localSensor: { text: "fetchFromLocalSensor()" },
      backupService: { text: "fetchFromBackupService()" },
      result: { text: "Effect.firstSuccessOf([...])" },
    }),
    []
  );

  const tasks = useMemo(
    () => [weatherAPI, localSensor, backupService],
    [weatherAPI, localSensor, backupService]
  );

  return (
    <EffectExample
      name={metadata.name}
      {...(metadata.variant && { variant: metadata.variant })}
      description={metadata.description}
      code={codeSnippet}
      effects={tasks}
      resultEffect={firstSuccessOfTask}
      effectHighlightMap={taskHighlightMap}
      {...(index !== undefined && { index })}
      exampleId={exampleId}
    />
  );
}

export default EffectFirstSuccessOfExample;
