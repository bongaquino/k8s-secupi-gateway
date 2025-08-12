{{/*
Expand the name of the chart.
*/}}
{{- define "secupi-gateway.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "secupi-gateway.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "secupi-gateway.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "secupi-gateway.labels" -}}
helm.sh/chart: {{ include "secupi-gateway.chart" . }}
{{ include "secupi-gateway.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "secupi-gateway.selectorLabels" -}}
app.kubernetes.io/name: {{ include "secupi-gateway.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "secupi-gateway.serviceAccountName" -}}
{{- if .Values.gateway.serviceAccount.create }}
{{- default (include "secupi-gateway.fullname" .) .Values.gateway.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.gateway.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the Hazelcast service
*/}}
{{- define "secupi_gateway_hz_service.name" -}}
{{- printf "%s-hz" (include "secupi-gateway.fullname" .) }}
{{- end }}

{{/*
Get the Kubernetes DNS domain
*/}}
{{- define "kubernetes_dnsdomain" -}}
{{- .Values.kubernetesDNSDomain | default "cluster.local" }}
{{- end }}
