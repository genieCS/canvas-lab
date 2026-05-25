# Canvas Lab

브라우저에서 바로 사용하는 이미지 변환 웹앱입니다.

## 기능

- 이미지 픽셀 사이즈 변경
- PNG, JPEG, WebP 확장자 변환
- JPEG/WebP 품질 조절을 통한 이미지 압축
- gifsicle-wasm 기반 GIF → GIF 압축
- 변환 결과 미리보기 및 다운로드

## 실행

기본 이미지 변환은 `index.html` 파일을 브라우저에서 열면 바로 사용할 수 있습니다.

GIF 압축은 Web Worker와 WebAssembly 파일을 불러오므로 로컬 확인 시 정적 서버로 실행하는 것을 권장합니다. 별도 백엔드 서버는 필요하지 않습니다.

로컬 서버로 확인하려면 아래 명령을 실행한 뒤 `http://localhost:4173`으로 접속하세요.

```bash
python3 -m http.server 4173
```

## 외부 런타임

GIF 최적화에는 `vendor/`에 포함된 `gifsicle-wasm`을 사용합니다.

## 배포 빌드

```bash
npm install
npm run build
```

압축된 정적 파일은 `dist/`에 생성됩니다.

빌드 결과를 로컬에서 확인하려면 아래 명령을 실행한 뒤 `http://localhost:4173`으로 접속하세요.

```bash
npm run preview
```

Vercel에서는 `vercel.json` 설정에 따라 `npm run build`를 실행하고 `dist/`를 배포합니다.
