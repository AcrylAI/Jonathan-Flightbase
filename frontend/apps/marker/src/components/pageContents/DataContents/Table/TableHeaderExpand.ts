type LangProps = {
  cancel: string;
  range: string;
  status: string;
  allConnectedData: string;
  dataInThisPage: string;
  notAssigned: string;
  workInProgress: string;
  completeData: string;
};

class TableHeader {
  private selectCancelButton: HTMLElement | null = null;

  protected noAssignmentDataButton: HTMLElement | null = null;

  private workingDataButton: HTMLElement | null = null;

  private completeDataButton: HTMLElement | null = null;

  private thisPageData: HTMLElement | null = null;

  private allData: HTMLElement | null = null;

  private selectedCancelFunction!: () => void;

  private workingDataFunction!: () => void;

  private noAssignedDataFunction!: () => void;

  private thisDataRangeFunction!: () => void;

  private allDataRangeFunction!: () => void;

  private completeDataFunction!: () => void;

  private rangText: HTMLElement | null = null;

  private statusText: HTMLElement | null = null;

  assignFunction(
    selectedCancel: () => void,
    workingData: () => void,
    noAssignedData: () => void,
    thisDataRange: () => void,
    allDataRange: () => void,
    completeData: () => void,
  ) {
    this.selectedCancelFunction = selectedCancel;
    this.workingDataFunction = workingData;
    this.noAssignedDataFunction = noAssignedData;
    this.thisDataRangeFunction = thisDataRange;
    this.allDataRangeFunction = allDataRange;
    this.completeDataFunction = completeData;
  }

  createElement() {
    const divElement = document.createElement('div');
    divElement.style.height = '100px';
    divElement.style.backgroundColor = '#F9FAFB';
    divElement.style.width = '100%';
    divElement.id = 'ExpandedHeader';
    divElement.innerHTML = `<div id='headerExpand-container'>
         <div id='first-content'>
            <span id='info-text'></span>
            <button id='selectCancel'></button>
          </div>
          <div>
           <span id='range-label'></span>
            <button id='allData'></button
            ><button id='thisPageData'></button>
            <span id='status-label'></span>
            <button id='noAssignmentData'></button
            ><button id='workingData'></button
            ><button id='completeData'></button>
          </div>
        </div>`;

    document.getElementsByClassName('rdt_TableHead')[0].appendChild(divElement);
  }

  addEventListener() {
    this.rangText = document.getElementById('range-label');
    this.statusText = document.getElementById('status-label');
    this.selectCancelButton = document.getElementById('selectCancel');
    this.selectCancelButton?.addEventListener(
      'click',
      this.selectedCancelFunction,
    );

    this.noAssignmentDataButton = document.getElementById('noAssignmentData');
    this.noAssignmentDataButton?.addEventListener(
      'click',
      this.noAssignedDataFunction,
    );
    this.workingDataButton = document.getElementById('workingData');
    this.workingDataButton?.addEventListener('click', this.workingDataFunction);
    this.completeDataButton = document.getElementById('completeData');
    this.completeDataButton?.addEventListener('click', this.completeDataFunction);
    this.thisPageData = document.getElementById('thisPageData');
    this.thisPageData?.addEventListener('click', this.thisDataRangeFunction);
    this.allData = document.getElementById('allData');
    this.allData?.addEventListener('click', this.allDataRangeFunction);

    this.addStyle();
  }

  addText({
    cancel,
    range,
    status,
    allConnectedData,
    dataInThisPage,
    notAssigned,
    workInProgress,
    completeData,
  }: LangProps) {
    if (this.selectCancelButton) {
      this.selectCancelButton.innerText = cancel;
    }
    if (this.rangText) {
      this.rangText.innerText = range;
    }
    if (this.statusText) {
      this.statusText.innerText = status;
    }
    if (this.allData) {
      this.allData.innerText = allConnectedData;
    }
    if (this.thisPageData) {
      this.thisPageData.innerText = dataInThisPage;
    }
    if (this.noAssignmentDataButton) {
      this.noAssignmentDataButton.innerText = notAssigned;
    }
    if (this.workingDataButton) {
      this.workingDataButton.innerText = workInProgress;
    }
    if(this.completeDataButton) {
      this.completeDataButton.innerText = completeData;
    }
  }

  addStyle() {
    document.getElementById('range-label')?.classList.add('text-label');
    document.getElementById('status-label')?.classList.add('text-label');
    document.getElementById('status-label')?.classList.add('status-label');
    document.getElementById('info-text')?.classList.add('info-text');
    this.selectCancelButton?.classList.add('selectCancel');
    document
      .getElementById('headerExpand-container')
      ?.classList.add('headerExpand-container');
    document.getElementById('first-content')?.classList.add('first-content');
    this.noAssignmentDataButton?.classList.add('clicked-left-button');
    this.workingDataButton?.classList.add('no-clicked-center-button'/*'no-clicked-right-button'*/);
    this.completeDataButton?.classList.add('no-clicked-right-button');
    this.allData?.classList.add('no-clicked-button');
    this.thisPageData?.classList.add('no-clicked-right-button');
    this.allData?.classList.add('clicked-left-button');
  }

  noAssignDataButtonClickStyle() {
    // 미할당
    this.noAssignmentDataButton?.classList.remove('no-clicked-left-button');
    this.noAssignmentDataButton?.classList.add('clicked-left-button');
    this.workingDataButton?.classList.remove('clicked-center-button');
    this.workingDataButton?.classList.add('no-clicked-center-button');
    this.completeDataButton?.classList.remove('clicked-right-button');
    this.completeDataButton?.classList.add('no-clicked-right-button');
  }

  workingDataButtonClickStyle() {
    // 작업중
    this.noAssignmentDataButton?.classList.remove('clicked-left-button');
    this.noAssignmentDataButton?.classList.add('no-clicked-left-button');
    this.workingDataButton?.classList.remove('no-clicked-center-button');
    this.workingDataButton?.classList.add('clicked-center-button');
    this.completeDataButton?.classList.remove('clicked-right-button');
    this.completeDataButton?.classList.add('no-clicked-right-button');
  }

  completeDataButtonClickStyle() {
    // 작업중
    this.noAssignmentDataButton?.classList.remove('clicked-left-button');
    this.noAssignmentDataButton?.classList.add('no-clicked-left-button');
    this.workingDataButton?.classList.add('no-clicked-center-button');
    this.workingDataButton?.classList.remove('clicked-center-button');
    this.completeDataButton?.classList.remove('no-clicked-right-button');
    this.completeDataButton?.classList.add('clicked-right-button');
  }

  thisPageRangeButtonClickStyle() {
    // 이 페이지의 데이터
    this.thisPageData?.classList.remove('no-clicked-right-button');
    this.thisPageData?.classList.add('clicked-right-button');
    this.thisPageData?.classList.remove('clicked-left-button');
    this.allData?.classList.add('no-clicked-left-button');
  }

  allDataButtonClickStyle() {
    // 연결된 모든 데이터
    this.thisPageData?.classList.remove('clicked-right-button');
    this.thisPageData?.classList.add('no-clicked-right-button');
    this.allData?.classList.remove('no-clicked-left-button');
    this.allData?.classList.add('clicked-left-button');
  }

  deleteElement() {
    const divElement = document.getElementById('ExpandedHeader');
    divElement?.remove();
  }

  changeInfoText(text: string) {
    const element = document.getElementById('info-text') as HTMLInputElement;
    element.innerHTML = text;
  }
}

export default TableHeader;
