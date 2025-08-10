import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineExecutionStatus, PipelineStageStatus, type PipelineStatus } from "@/components/PipelineStatusBadge";

// Example data matching the screenshot shown by the user
const mockPipelineData = [
  {
    id: "1",
    pipelineName: "bongaquino-staging-deploy-pipeline",
    status: "FAILED" as PipelineStatus,
    environment: "STAGING",
    timestamp: "Today at 21:04",
    stages: [
      {
        id: "deploy-stage",
        stageName: "Deploy",
        status: "FAILED" as PipelineStatus,
        pipelineName: "bongaquino-staging-deploy-pipeline",
        environment: "STAGING",
        timestamp: "Today at 21:04"
      }
    ]
  },
  {
    id: "2", 
    pipelineName: "bongaquino-uat-backend-pipeline",
    status: "SUCCEEDED" as PipelineStatus,
    environment: "UAT",
    timestamp: "Today at 20:30",
    stages: [
      {
        id: "build-stage",
        stageName: "Build", 
        status: "SUCCEEDED" as PipelineStatus,
        pipelineName: "bongaquino-uat-backend-pipeline",
        environment: "UAT",
        timestamp: "Today at 20:30"
      },
      {
        id: "deploy-stage",
        stageName: "Deploy",
        status: "SUCCEEDED" as PipelineStatus, 
        pipelineName: "bongaquino-uat-backend-pipeline",
        environment: "UAT",
        timestamp: "Today at 20:30"
      }
    ]
  }
];

const PipelineStatusPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pipeline Status</h1>
      </div>

      {/* Recent Pipeline Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pipeline Executions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockPipelineData.map((pipeline) => (
            <PipelineExecutionStatus
              key={pipeline.id}
              pipelineName={pipeline.pipelineName}
              status={pipeline.status}
              environment={pipeline.environment}
              timestamp={pipeline.timestamp}
            />
          ))}
        </CardContent>
      </Card>

      {/* Pipeline Stages */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Stages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockPipelineData.flatMap((pipeline) =>
            pipeline.stages.map((stage) => (
              <PipelineStageStatus
                key={`${pipeline.id}-${stage.id}`}
                stageName={stage.stageName}
                status={stage.status}
                pipelineName={stage.pipelineName}
                environment={stage.environment}
                timestamp={stage.timestamp}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Failed Pipelines Only */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Failed Pipeline Executions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockPipelineData
            .filter((pipeline) => pipeline.status === "FAILED")
            .map((pipeline) => (
              <div key={pipeline.id} className="space-y-2">
                <PipelineExecutionStatus
                  pipelineName={pipeline.pipelineName}
                  status={pipeline.status}
                  environment={pipeline.environment}
                  timestamp={pipeline.timestamp}
                />
                {/* Show failed stages */}
                {pipeline.stages
                  .filter((stage) => stage.status === "FAILED")
                  .map((stage) => (
                    <PipelineStageStatus
                      key={`${pipeline.id}-${stage.id}`}
                      stageName={stage.stageName}
                      status={stage.status}
                      pipelineName={stage.pipelineName}
                      environment={stage.environment}
                      timestamp={stage.timestamp}
                      className="ml-4"
                    />
                  ))}
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelineStatusPage; 