/* eslint-disable jsx-a11y/label-has-associated-control */
'use client';
import React, { useEffect, useRef, useState } from 'react';
import prizeWheelService from '@/app/[locale]/(marketing)/api/prizewheel';
import WheelComponent from './Wheel';

const COLORS = ['#f82', '#0bf', '#fb0', '#0fb', '#b0f', '#f0b', '#bf0'];

function getMaskedPhone(phoneNumber: string) {
  if (!phoneNumber || phoneNumber.length < 3) {
    return phoneNumber;
  }
  return `${phoneNumber.slice(0, -3)}***`;
}

export default function PrizeWheelComponent() {
  const [segments, setSegments] = useState([]);
  const [isDisplay, setIsDisplay] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [prizeCustomerDetail, setPrizeCustomerDetail] = useState([]);
  const [historySpins, setHistorySpins] = useState<any[]>([]);
  const [selectedSpinId, setSelectedSpinId] = useState<any>();
  const [isShowHistory, setIsShowHistory] = useState(false);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [sprinCurrent, setSprinCurrent] = useState<any>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy lịch sử spins khi mount
  useEffect(() => {
    prizeWheelService.getHistorySpins().then(setHistorySpins);
  }, []);

  // Hàm highlight khách hàng
  function startHighlight() {
    let i = 0;
    const indexWiner = 7;
    let index = highlightedIndex >= 0 ? highlightedIndex : 0;
    intervalRef.current = setInterval(() => {
      setHighlightedIndex(index);
      index = (index + 1) % customers.length;
      if (index === indexWiner && i > 20) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current!);
        }
      }
      i++;
    }, 500);
  }

  function stopHighlight() {
    clearInterval(intervalRef.current!);
  }

  // Xử lý dropdown thay đổi
  function onDropdownChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    if (value === sprinCurrent?.settingId) {
      setIsShowHistory(false);
      return;
    }
    setIsShowHistory(true);
    prizeWheelService.getListPrizeCustomerWithId(value).then((response: any) => {
      setUserHistory(response[0]?.details || []);
    });
  }

  // Giả lập useEffect cho logic khởi tạo (tương tự ngAfterViewInit)
  useEffect(() => {
    async function fetchData() {
      const [settings, prizes, prizeCustomer] = await Promise.all([
        prizeWheelService.getListSettingsSpin(),
        prizeWheelService.getListPrize(),
        prizeWheelService.getListPrizeCustomer(),
      ]);
      const currentDate = new Date();
      const validSettings = settings
        .filter((setting: any) => new Date(setting.timeEnd) > currentDate)
        .sort(
          (a: any, b: any) =>
            new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime(),
        );
      if (validSettings.length > 0) {
        const currentSetting = validSettings[0];
        setSprinCurrent(currentSetting);
        setHistorySpins(prev => [
          ...prev,
          {
            settingId: currentSetting.settingId,
            name: `${currentSetting.name}(Mới nhất)`,
          },
        ]);
        setCustomers(currentSetting.customers?.slice(0, 8) || []);
        setUsers([]);
        setPrizeCustomerDetail(
          prizeCustomer.find(
            p => p.settingsSpinId === currentSetting.settingId,
          )?.details || [],
        );
        setSegments(
          (prizes[0]?.goods || []).map((opts: any, i: number) => ({
            text: opts.name,
            color: COLORS[(i >= COLORS.length ? i + 1 : i) % COLORS.length],
            image: `/images/${opts.image}`,
          })),
        );
        setIsDisplay(true);
        startHighlight();
      }
    }
    fetchData();
    return () => stopHighlight();
  }, []);

  return (
    isDisplay && (
      <div>
        <div className="row g-4 mb-3 flex justify-content-center" style={{ marginLeft: 10, marginRight: 10 }}>
          <div className="col-xl-4 text-center">
            <div className="wheel-item h-full">
              <div className="title mb-3">
                <h1 className="text-title-color">Vòng quay may mắn</h1>
              </div>
              <hr style={{ margin: '0.25rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div>
                  <WheelComponent
                    segments={segments}
                    winningSegment="Prize 1"
                    primaryColor="red"
                    contrastColor="white"
                    buttonText="SPIN"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="wheel-item h-full customer">
              <div className="title flex justify-content-center">
                <h1 className="text-title-color">Danh sách khách hàng</h1>
              </div>
              <hr style={{ margin: '0.25rem 0' }} />
              <div className="customer-list">
                {customers.map((customer, i) => (
                  <div
                    className={`text-center${i === highlightedIndex ? ' highlight' : ''}`}
                    key={i}
                  >
                    {customer.name}
                    {' '}
                    -
                    {getMaskedPhone(customer.phone)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-xl-4">
            <div className="wheel-item h-full">
              <div className="title text-center">
                <h1 className="text-title-color">Thông tin giải thưởng</h1>
              </div>
              <hr style={{ margin: '0.25rem 0' }} />
              <div className="award">
                <label className="award-name">Ngày nhận thưởng: </label>
                <select
                  className="w-full"
                  value={selectedSpinId || ''}
                  onChange={(e) => {
                    setSelectedSpinId(e.target.value);
                    onDropdownChange(e);
                  }}
                >
                  <option value="">Chọn cấu hình quay thưởng</option>
                  {historySpins.map(spin => (
                    <option key={spin.settingId} value={spin.settingId}>
                      {spin.name}
                    </option>
                  ))}
                </select>
              </div>
              <hr style={{ margin: '0.25rem 0' }} />
              {/* Xem lịch sử */}
              {isShowHistory
                ? (
                    <div>
                      {userHistory.map((user, i) => (
                        <div key={i}>
                          <div className="award-name">
                            Tên giải:
                            {user?.prizeName}
                          </div>
                          <div style={{ fontWeight: 500 }}>
                            Khách hàng:
                            {user?.customerName}
                          </div>
                          <div style={{ fontWeight: 500 }}>
                            Phần thưởng:
                            {user?.goodName}
                          </div>
                          <hr style={{ margin: '0.25rem 0' }} />
                        </div>
                      ))}
                      <div
                        dangerouslySetInnerHTML={{ __html: status }}
                        style={{ fontWeight: 600, fontSize: '1.25rem' }}
                      />
                    </div>
                  )
                : (
                    <div>
                      {users.map((user, i) => (
                        <div key={i}>
                          <div className="award-name">
                            Tên giải:
                            {user?.prizeName}
                          </div>
                          <div style={{ fontWeight: 500 }}>
                            Khách hàng:
                            {user?.customerName}
                          </div>
                          <div style={{ fontWeight: 500 }}>
                            Phần thưởng:
                            {user?.goodName}
                          </div>
                          <hr style={{ margin: '0.25rem 0' }} />
                        </div>
                      ))}
                      <div
                        dangerouslySetInnerHTML={{ __html: status }}
                        style={{ fontWeight: 600, fontSize: '1.25rem' }}
                      />
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>
    )
  );
}
