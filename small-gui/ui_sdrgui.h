/********************************************************************************
** Form generated from reading UI file 'sdrgui.ui'
**
** Created by: Qt User Interface Compiler version 4.8.6
**
** WARNING! All changes made in this file will be lost when recompiling UI file!
********************************************************************************/

#ifndef UI_SDRGUI_H
#define UI_SDRGUI_H

#include <Qt3Support/Q3MimeSourceFactory>
#include <QtCore/QVariant>
#include <QtGui/QAction>
#include <QtGui/QApplication>
#include <QtGui/QButtonGroup>
#include <QtGui/QComboBox>
#include <QtGui/QDialog>
#include <QtGui/QHeaderView>
#include <QtGui/QLCDNumber>
#include <QtGui/QLabel>
#include <QtGui/QPushButton>
#include <QtGui/QSlider>
#include <QtGui/QSpinBox>

QT_BEGIN_NAMESPACE

class Ui_elektorSDR
{
public:
    QLCDNumber *lcd_Frequency;
    QLCDNumber *attenuationLevelDisplay;
    QLabel *systemindicator;
    QLCDNumber *lcd_fmRate;
    QComboBox *streamOutSelector;
    QLabel *timeDisplay;
    QPushButton *quitButton;
    QLCDNumber *lcd_OutputRate;
    QPushButton *fc_plus;
    QPushButton *fc_minus;
    QLabel *incrementingFlag;
    QPushButton *f_minus;
    QPushButton *f_plus;
    QSpinBox *fm_increment;
    QPushButton *pauseButton;
    QSpinBox *minimumSelect;
    QSpinBox *maximumSelect;
    QLCDNumber *lcd_inputRate;
    QSlider *squelchSlider;
    QPushButton *squelchButton;
    QSlider *attenuationSlider;
    QSlider *volumeSlider;
    QPushButton *startButton;
    QComboBox *fmDecoder;
    QLabel *decoderDisplay;
    QLabel *radioTextBox;
    QLabel *stationLabelTextBox;
    QComboBox *fmMode;
    QComboBox *fmChannelSelect;
    QComboBox *fmDeemphasisSelector;
    QComboBox *fmRdsSelector;
    QLabel *rdsSyncLabel;
    QLabel *speechLabel;
    QLabel *pll_isLocked;
    QLabel *label_6;
    QLCDNumber *rdsAFDisplay;
    QLabel *label_11;
    QLCDNumber *rdsPiDisplay;
    QLCDNumber *dc_component;
    QSpinBox *gainSelector;
    QPushButton *freqButton;
    QPushButton *audioDump;
    QPushButton *minusOne;
    QPushButton *plusOne;

    void setupUi(QDialog *elektorSDR)
    {
        if (elektorSDR->objectName().isEmpty())
            elektorSDR->setObjectName(QString::fromUtf8("elektorSDR"));
        elektorSDR->resize(776, 226);
        QPalette palette;
        QBrush brush(QColor(255, 255, 255, 255));
        brush.setStyle(Qt::SolidPattern);
        palette.setBrush(QPalette::Active, QPalette::Base, brush);
        palette.setBrush(QPalette::Active, QPalette::Window, brush);
        palette.setBrush(QPalette::Inactive, QPalette::Base, brush);
        palette.setBrush(QPalette::Inactive, QPalette::Window, brush);
        palette.setBrush(QPalette::Disabled, QPalette::Base, brush);
        palette.setBrush(QPalette::Disabled, QPalette::Window, brush);
        elektorSDR->setPalette(palette);
        QFont font;
        font.setBold(false);
        font.setWeight(50);
        elektorSDR->setFont(font);
        lcd_Frequency = new QLCDNumber(elektorSDR);
        lcd_Frequency->setObjectName(QString::fromUtf8("lcd_Frequency"));
        lcd_Frequency->setGeometry(QRect(570, 180, 191, 41));
        QPalette palette1;
        QBrush brush1(QColor(255, 0, 0, 255));
        brush1.setStyle(Qt::SolidPattern);
        palette1.setBrush(QPalette::Active, QPalette::Button, brush1);
        QBrush brush2(QColor(255, 255, 0, 255));
        brush2.setStyle(Qt::SolidPattern);
        palette1.setBrush(QPalette::Active, QPalette::Base, brush2);
        palette1.setBrush(QPalette::Active, QPalette::Window, brush2);
        palette1.setBrush(QPalette::Inactive, QPalette::Button, brush1);
        palette1.setBrush(QPalette::Inactive, QPalette::Base, brush2);
        palette1.setBrush(QPalette::Inactive, QPalette::Window, brush2);
        palette1.setBrush(QPalette::Disabled, QPalette::Button, brush1);
        palette1.setBrush(QPalette::Disabled, QPalette::Base, brush2);
        palette1.setBrush(QPalette::Disabled, QPalette::Window, brush2);
        lcd_Frequency->setPalette(palette1);
        QFont font1;
        font1.setPointSize(17);
        font1.setBold(true);
        font1.setItalic(true);
        font1.setWeight(75);
        lcd_Frequency->setFont(font1);
        lcd_Frequency->setAutoFillBackground(false);
        lcd_Frequency->setFrameShape(QFrame::NoFrame);
        lcd_Frequency->setFrameShadow(QFrame::Raised);
        lcd_Frequency->setLineWidth(2);
        lcd_Frequency->setDigitCount(10);
        lcd_Frequency->setSegmentStyle(QLCDNumber::Flat);
        attenuationLevelDisplay = new QLCDNumber(elektorSDR);
        attenuationLevelDisplay->setObjectName(QString::fromUtf8("attenuationLevelDisplay"));
        attenuationLevelDisplay->setGeometry(QRect(710, 60, 41, 21));
        QPalette palette2;
        palette2.setBrush(QPalette::Active, QPalette::Base, brush);
        palette2.setBrush(QPalette::Active, QPalette::Window, brush2);
        palette2.setBrush(QPalette::Inactive, QPalette::Base, brush);
        palette2.setBrush(QPalette::Inactive, QPalette::Window, brush2);
        palette2.setBrush(QPalette::Disabled, QPalette::Base, brush2);
        palette2.setBrush(QPalette::Disabled, QPalette::Window, brush2);
        attenuationLevelDisplay->setPalette(palette2);
        attenuationLevelDisplay->setAutoFillBackground(false);
        attenuationLevelDisplay->setFrameShape(QFrame::NoFrame);
        attenuationLevelDisplay->setFrameShadow(QFrame::Raised);
        attenuationLevelDisplay->setLineWidth(2);
        attenuationLevelDisplay->setDigitCount(3);
        attenuationLevelDisplay->setSegmentStyle(QLCDNumber::Flat);
        systemindicator = new QLabel(elektorSDR);
        systemindicator->setObjectName(QString::fromUtf8("systemindicator"));
        systemindicator->setGeometry(QRect(590, 30, 161, 31));
        QFont font2;
        font2.setPointSize(10);
        systemindicator->setFont(font2);
        systemindicator->setFrameShape(QFrame::Panel);
        systemindicator->setFrameShadow(QFrame::Raised);
        systemindicator->setLineWidth(2);
        lcd_fmRate = new QLCDNumber(elektorSDR);
        lcd_fmRate->setObjectName(QString::fromUtf8("lcd_fmRate"));
        lcd_fmRate->setGeometry(QRect(150, 180, 131, 31));
        QPalette palette3;
        palette3.setBrush(QPalette::Active, QPalette::Base, brush);
        palette3.setBrush(QPalette::Active, QPalette::Window, brush2);
        palette3.setBrush(QPalette::Inactive, QPalette::Base, brush);
        palette3.setBrush(QPalette::Inactive, QPalette::Window, brush2);
        palette3.setBrush(QPalette::Disabled, QPalette::Base, brush2);
        palette3.setBrush(QPalette::Disabled, QPalette::Window, brush2);
        lcd_fmRate->setPalette(palette3);
        lcd_fmRate->setAutoFillBackground(false);
        lcd_fmRate->setFrameShape(QFrame::NoFrame);
        lcd_fmRate->setFrameShadow(QFrame::Raised);
        lcd_fmRate->setLineWidth(2);
        lcd_fmRate->setDigitCount(6);
        lcd_fmRate->setSegmentStyle(QLCDNumber::Flat);
        streamOutSelector = new QComboBox(elektorSDR);
        streamOutSelector->setObjectName(QString::fromUtf8("streamOutSelector"));
        streamOutSelector->setGeometry(QRect(210, 0, 191, 41));
        QFont font3;
        font3.setPointSize(8);
        font3.setBold(false);
        font3.setItalic(true);
        font3.setWeight(50);
        streamOutSelector->setFont(font3);
        timeDisplay = new QLabel(elektorSDR);
        timeDisplay->setObjectName(QString::fromUtf8("timeDisplay"));
        timeDisplay->setGeometry(QRect(410, 29, 181, 31));
        timeDisplay->setFrameShape(QFrame::Panel);
        timeDisplay->setFrameShadow(QFrame::Raised);
        timeDisplay->setLineWidth(2);
        quitButton = new QPushButton(elektorSDR);
        quitButton->setObjectName(QString::fromUtf8("quitButton"));
        quitButton->setGeometry(QRect(130, 0, 81, 41));
        QPalette palette4;
        palette4.setBrush(QPalette::Active, QPalette::Button, brush1);
        palette4.setBrush(QPalette::Inactive, QPalette::Button, brush1);
        palette4.setBrush(QPalette::Disabled, QPalette::Button, brush1);
        quitButton->setPalette(palette4);
        QFont font4;
        font4.setBold(true);
        font4.setWeight(75);
        quitButton->setFont(font4);
        quitButton->setAutoFillBackground(true);
        lcd_OutputRate = new QLCDNumber(elektorSDR);
        lcd_OutputRate->setObjectName(QString::fromUtf8("lcd_OutputRate"));
        lcd_OutputRate->setGeometry(QRect(10, 180, 101, 31));
        QPalette palette5;
        palette5.setBrush(QPalette::Active, QPalette::Base, brush);
        palette5.setBrush(QPalette::Active, QPalette::Window, brush2);
        palette5.setBrush(QPalette::Inactive, QPalette::Base, brush);
        palette5.setBrush(QPalette::Inactive, QPalette::Window, brush2);
        palette5.setBrush(QPalette::Disabled, QPalette::Base, brush2);
        palette5.setBrush(QPalette::Disabled, QPalette::Window, brush2);
        lcd_OutputRate->setPalette(palette5);
        lcd_OutputRate->setAutoFillBackground(false);
        lcd_OutputRate->setFrameShape(QFrame::NoFrame);
        lcd_OutputRate->setLineWidth(2);
        lcd_OutputRate->setDigitCount(6);
        lcd_OutputRate->setSegmentStyle(QLCDNumber::Flat);
        fc_plus = new QPushButton(elektorSDR);
        fc_plus->setObjectName(QString::fromUtf8("fc_plus"));
        fc_plus->setGeometry(QRect(310, 90, 61, 31));
        fc_minus = new QPushButton(elektorSDR);
        fc_minus->setObjectName(QString::fromUtf8("fc_minus"));
        fc_minus->setGeometry(QRect(180, 90, 61, 31));
        incrementingFlag = new QLabel(elektorSDR);
        incrementingFlag->setObjectName(QString::fromUtf8("incrementingFlag"));
        incrementingFlag->setGeometry(QRect(240, 90, 71, 31));
        incrementingFlag->setFrameShape(QFrame::Box);
        incrementingFlag->setLineWidth(2);
        f_minus = new QPushButton(elektorSDR);
        f_minus->setObjectName(QString::fromUtf8("f_minus"));
        f_minus->setGeometry(QRect(180, 60, 91, 31));
        f_plus = new QPushButton(elektorSDR);
        f_plus->setObjectName(QString::fromUtf8("f_plus"));
        f_plus->setGeometry(QRect(280, 60, 91, 31));
        fm_increment = new QSpinBox(elektorSDR);
        fm_increment->setObjectName(QString::fromUtf8("fm_increment"));
        fm_increment->setGeometry(QRect(70, 90, 51, 31));
        fm_increment->setMaximum(1000);
        fm_increment->setSingleStep(100);
        fm_increment->setValue(100);
        pauseButton = new QPushButton(elektorSDR);
        pauseButton->setObjectName(QString::fromUtf8("pauseButton"));
        pauseButton->setGeometry(QRect(400, 0, 61, 31));
        minimumSelect = new QSpinBox(elektorSDR);
        minimumSelect->setObjectName(QString::fromUtf8("minimumSelect"));
        minimumSelect->setGeometry(QRect(10, 90, 61, 31));
        QFont font5;
        font5.setPointSize(9);
        minimumSelect->setFont(font5);
        minimumSelect->setButtonSymbols(QAbstractSpinBox::UpDownArrows);
        minimumSelect->setMaximum(1700);
        minimumSelect->setValue(86);
        maximumSelect = new QSpinBox(elektorSDR);
        maximumSelect->setObjectName(QString::fromUtf8("maximumSelect"));
        maximumSelect->setGeometry(QRect(120, 90, 61, 31));
        maximumSelect->setFont(font5);
        maximumSelect->setMaximum(1700);
        maximumSelect->setValue(110);
        lcd_inputRate = new QLCDNumber(elektorSDR);
        lcd_inputRate->setObjectName(QString::fromUtf8("lcd_inputRate"));
        lcd_inputRate->setGeometry(QRect(300, 180, 131, 31));
        QPalette palette6;
        palette6.setBrush(QPalette::Active, QPalette::Base, brush);
        palette6.setBrush(QPalette::Active, QPalette::Window, brush2);
        palette6.setBrush(QPalette::Inactive, QPalette::Base, brush);
        palette6.setBrush(QPalette::Inactive, QPalette::Window, brush2);
        palette6.setBrush(QPalette::Disabled, QPalette::Base, brush2);
        palette6.setBrush(QPalette::Disabled, QPalette::Window, brush2);
        lcd_inputRate->setPalette(palette6);
        lcd_inputRate->setAutoFillBackground(false);
        lcd_inputRate->setFrameShape(QFrame::NoFrame);
        lcd_inputRate->setLineWidth(2);
        lcd_inputRate->setDigitCount(7);
        lcd_inputRate->setSegmentStyle(QLCDNumber::Flat);
        squelchSlider = new QSlider(elektorSDR);
        squelchSlider->setObjectName(QString::fromUtf8("squelchSlider"));
        squelchSlider->setGeometry(QRect(400, 80, 271, 20));
        squelchSlider->setSliderPosition(50);
        squelchSlider->setOrientation(Qt::Horizontal);
        squelchButton = new QPushButton(elektorSDR);
        squelchButton->setObjectName(QString::fromUtf8("squelchButton"));
        squelchButton->setGeometry(QRect(690, 80, 81, 21));
        attenuationSlider = new QSlider(elektorSDR);
        attenuationSlider->setObjectName(QString::fromUtf8("attenuationSlider"));
        attenuationSlider->setGeometry(QRect(400, 60, 311, 19));
        QPalette palette7;
        palette7.setBrush(QPalette::Active, QPalette::WindowText, brush1);
        palette7.setBrush(QPalette::Inactive, QPalette::WindowText, brush1);
        QBrush brush3(QColor(143, 146, 147, 255));
        brush3.setStyle(Qt::SolidPattern);
        palette7.setBrush(QPalette::Disabled, QPalette::WindowText, brush3);
        attenuationSlider->setPalette(palette7);
        attenuationSlider->setAutoFillBackground(true);
        attenuationSlider->setMinimum(1);
        attenuationSlider->setMaximum(100);
        attenuationSlider->setValue(50);
        attenuationSlider->setOrientation(Qt::Horizontal);
        volumeSlider = new QSlider(elektorSDR);
        volumeSlider->setObjectName(QString::fromUtf8("volumeSlider"));
        volumeSlider->setGeometry(QRect(400, 100, 311, 20));
        volumeSlider->setOrientation(Qt::Horizontal);
        startButton = new QPushButton(elektorSDR);
        startButton->setObjectName(QString::fromUtf8("startButton"));
        startButton->setGeometry(QRect(10, 0, 121, 41));
        startButton->setFont(font4);
        startButton->setAutoFillBackground(true);
        fmDecoder = new QComboBox(elektorSDR);
        fmDecoder->setObjectName(QString::fromUtf8("fmDecoder"));
        fmDecoder->setGeometry(QRect(520, 0, 111, 31));
        decoderDisplay = new QLabel(elektorSDR);
        decoderDisplay->setObjectName(QString::fromUtf8("decoderDisplay"));
        decoderDisplay->setGeometry(QRect(630, -1, 121, 31));
        decoderDisplay->setFont(font5);
        decoderDisplay->setFrameShape(QFrame::Panel);
        decoderDisplay->setFrameShadow(QFrame::Raised);
        decoderDisplay->setLineWidth(2);
        radioTextBox = new QLabel(elektorSDR);
        radioTextBox->setObjectName(QString::fromUtf8("radioTextBox"));
        radioTextBox->setGeometry(QRect(10, 150, 541, 31));
        radioTextBox->setFrameShape(QFrame::Panel);
        radioTextBox->setFrameShadow(QFrame::Raised);
        stationLabelTextBox = new QLabel(elektorSDR);
        stationLabelTextBox->setObjectName(QString::fromUtf8("stationLabelTextBox"));
        stationLabelTextBox->setGeometry(QRect(130, 120, 171, 31));
        stationLabelTextBox->setFrameShape(QFrame::Panel);
        stationLabelTextBox->setFrameShadow(QFrame::Raised);
        stationLabelTextBox->setLineWidth(2);
        fmMode = new QComboBox(elektorSDR);
        fmMode->setObjectName(QString::fromUtf8("fmMode"));
        fmMode->setGeometry(QRect(540, 120, 81, 31));
        fmChannelSelect = new QComboBox(elektorSDR);
        fmChannelSelect->setObjectName(QString::fromUtf8("fmChannelSelect"));
        fmChannelSelect->setGeometry(QRect(620, 120, 81, 31));
        fmDeemphasisSelector = new QComboBox(elektorSDR);
        fmDeemphasisSelector->setObjectName(QString::fromUtf8("fmDeemphasisSelector"));
        fmDeemphasisSelector->setGeometry(QRect(700, 120, 61, 31));
        fmRdsSelector = new QComboBox(elektorSDR);
        fmRdsSelector->setObjectName(QString::fromUtf8("fmRdsSelector"));
        fmRdsSelector->setGeometry(QRect(300, 120, 91, 31));
        rdsSyncLabel = new QLabel(elektorSDR);
        rdsSyncLabel->setObjectName(QString::fromUtf8("rdsSyncLabel"));
        rdsSyncLabel->setGeometry(QRect(390, 120, 41, 31));
        rdsSyncLabel->setFrameShape(QFrame::Panel);
        rdsSyncLabel->setFrameShadow(QFrame::Raised);
        rdsSyncLabel->setLineWidth(2);
        speechLabel = new QLabel(elektorSDR);
        speechLabel->setObjectName(QString::fromUtf8("speechLabel"));
        speechLabel->setGeometry(QRect(430, 120, 61, 31));
        speechLabel->setFrameShape(QFrame::Panel);
        speechLabel->setFrameShadow(QFrame::Raised);
        speechLabel->setLineWidth(2);
        pll_isLocked = new QLabel(elektorSDR);
        pll_isLocked->setObjectName(QString::fromUtf8("pll_isLocked"));
        pll_isLocked->setGeometry(QRect(490, 120, 51, 31));
        pll_isLocked->setFrameShape(QFrame::Panel);
        pll_isLocked->setFrameShadow(QFrame::Raised);
        pll_isLocked->setLineWidth(2);
        label_6 = new QLabel(elektorSDR);
        label_6->setObjectName(QString::fromUtf8("label_6"));
        label_6->setGeometry(QRect(650, 150, 51, 21));
        rdsAFDisplay = new QLCDNumber(elektorSDR);
        rdsAFDisplay->setObjectName(QString::fromUtf8("rdsAFDisplay"));
        rdsAFDisplay->setGeometry(QRect(580, 150, 64, 23));
        QPalette palette8;
        palette8.setBrush(QPalette::Active, QPalette::Base, brush);
        palette8.setBrush(QPalette::Active, QPalette::Window, brush2);
        palette8.setBrush(QPalette::Inactive, QPalette::Base, brush);
        palette8.setBrush(QPalette::Inactive, QPalette::Window, brush2);
        palette8.setBrush(QPalette::Disabled, QPalette::Base, brush2);
        palette8.setBrush(QPalette::Disabled, QPalette::Window, brush2);
        rdsAFDisplay->setPalette(palette8);
        rdsAFDisplay->setAutoFillBackground(false);
        rdsAFDisplay->setFrameShape(QFrame::NoFrame);
        rdsAFDisplay->setSegmentStyle(QLCDNumber::Flat);
        label_11 = new QLabel(elektorSDR);
        label_11->setObjectName(QString::fromUtf8("label_11"));
        label_11->setGeometry(QRect(550, 150, 41, 21));
        rdsPiDisplay = new QLCDNumber(elektorSDR);
        rdsPiDisplay->setObjectName(QString::fromUtf8("rdsPiDisplay"));
        rdsPiDisplay->setGeometry(QRect(710, 150, 51, 21));
        QPalette palette9;
        palette9.setBrush(QPalette::Active, QPalette::Base, brush);
        palette9.setBrush(QPalette::Active, QPalette::Window, brush2);
        palette9.setBrush(QPalette::Inactive, QPalette::Base, brush);
        palette9.setBrush(QPalette::Inactive, QPalette::Window, brush2);
        palette9.setBrush(QPalette::Disabled, QPalette::Base, brush2);
        palette9.setBrush(QPalette::Disabled, QPalette::Window, brush2);
        rdsPiDisplay->setPalette(palette9);
        rdsPiDisplay->setAutoFillBackground(false);
        rdsPiDisplay->setFrameShape(QFrame::NoFrame);
        rdsPiDisplay->setMode(QLCDNumber::Hex);
        rdsPiDisplay->setSegmentStyle(QLCDNumber::Flat);
        dc_component = new QLCDNumber(elektorSDR);
        dc_component->setObjectName(QString::fromUtf8("dc_component"));
        dc_component->setGeometry(QRect(460, 0, 51, 31));
        QPalette palette10;
        palette10.setBrush(QPalette::Active, QPalette::Base, brush);
        palette10.setBrush(QPalette::Active, QPalette::Window, brush2);
        palette10.setBrush(QPalette::Inactive, QPalette::Base, brush);
        palette10.setBrush(QPalette::Inactive, QPalette::Window, brush2);
        palette10.setBrush(QPalette::Disabled, QPalette::Base, brush2);
        palette10.setBrush(QPalette::Disabled, QPalette::Window, brush2);
        dc_component->setPalette(palette10);
        dc_component->setAutoFillBackground(false);
        dc_component->setFrameShape(QFrame::NoFrame);
        dc_component->setSegmentStyle(QLCDNumber::Flat);
        gainSelector = new QSpinBox(elektorSDR);
        gainSelector->setObjectName(QString::fromUtf8("gainSelector"));
        gainSelector->setGeometry(QRect(130, 40, 51, 33));
        freqButton = new QPushButton(elektorSDR);
        freqButton->setObjectName(QString::fromUtf8("freqButton"));
        freqButton->setGeometry(QRect(10, 40, 121, 51));
        audioDump = new QPushButton(elektorSDR);
        audioDump->setObjectName(QString::fromUtf8("audioDump"));
        audioDump->setGeometry(QRect(10, 120, 91, 31));
        minusOne = new QPushButton(elektorSDR);
        minusOne->setObjectName(QString::fromUtf8("minusOne"));
        minusOne->setGeometry(QRect(180, 40, 97, 21));
        plusOne = new QPushButton(elektorSDR);
        plusOne->setObjectName(QString::fromUtf8("plusOne"));
        plusOne->setGeometry(QRect(270, 40, 97, 21));

        retranslateUi(elektorSDR);

        QMetaObject::connectSlotsByName(elektorSDR);
    } // setupUi

    void retranslateUi(QDialog *elektorSDR)
    {
        elektorSDR->setWindowTitle(QApplication::translate("elektorSDR", "fm-receiver", 0, QApplication::UnicodeUTF8));
        elektorSDR->setWindowIconText(QApplication::translate("elektorSDR", "QUIT", 0, QApplication::UnicodeUTF8));
        systemindicator->setText(QApplication::translate("elektorSDR", "JFF-ESDR V2.0 Portaudio", 0, QApplication::UnicodeUTF8));
        streamOutSelector->clear();
        streamOutSelector->insertItems(0, QStringList()
         << QApplication::translate("elektorSDR", "select output", 0, QApplication::UnicodeUTF8)
        );
        timeDisplay->setText(QApplication::translate("elektorSDR", "TextLabel", 0, QApplication::UnicodeUTF8));
        quitButton->setText(QApplication::translate("elektorSDR", "QUIT", 0, QApplication::UnicodeUTF8));
        fc_plus->setText(QApplication::translate("elektorSDR", "fc+", 0, QApplication::UnicodeUTF8));
        fc_minus->setText(QApplication::translate("elektorSDR", "fc-", 0, QApplication::UnicodeUTF8));
        incrementingFlag->setText(QString());
        f_minus->setText(QApplication::translate("elektorSDR", "f-", 0, QApplication::UnicodeUTF8));
        f_plus->setText(QApplication::translate("elektorSDR", "f+", 0, QApplication::UnicodeUTF8));
        pauseButton->setText(QApplication::translate("elektorSDR", "Pause", 0, QApplication::UnicodeUTF8));
        squelchButton->setText(QApplication::translate("elektorSDR", "squelchOff", 0, QApplication::UnicodeUTF8));
        startButton->setText(QApplication::translate("elektorSDR", "START", 0, QApplication::UnicodeUTF8));
        fmDecoder->clear();
        fmDecoder->insertItems(0, QStringList()
         << QApplication::translate("elektorSDR", "fm1decoder", 0, QApplication::UnicodeUTF8)
         << QApplication::translate("elektorSDR", "fm2decoder", 0, QApplication::UnicodeUTF8)
         << QApplication::translate("elektorSDR", "fm3decoder", 0, QApplication::UnicodeUTF8)
         << QApplication::translate("elektorSDR", "fm4decoder", 0, QApplication::UnicodeUTF8)
         << QApplication::translate("elektorSDR", "fm5decoder", 0, QApplication::UnicodeUTF8)
        );
        decoderDisplay->setText(QString());
        radioTextBox->setText(QApplication::translate("elektorSDR", "TextLabel", 0, QApplication::UnicodeUTF8));
        stationLabelTextBox->setText(QApplication::translate("elektorSDR", "TextLabel", 0, QApplication::UnicodeUTF8));
        fmMode->clear();
        fmMode->insertItems(0, QStringList()
         << QApplication::translate("elektorSDR", "stereo", 0, QApplication::UnicodeUTF8)
         << QApplication::translate("elektorSDR", "mono", 0, QApplication::UnicodeUTF8)
        );
        fmChannelSelect->clear();
        fmChannelSelect->insertItems(0, QStringList()
         << QApplication::translate("elektorSDR", "stereo", 0, QApplication::UnicodeUTF8)
         << QApplication::translate("elektorSDR", "Left", 0, QApplication::UnicodeUTF8)
         << QApplication::translate("elektorSDR", "Right", 0, QApplication::UnicodeUTF8)
         << QApplication::translate("elektorSDR", "Left+Right", 0, QApplication::UnicodeUTF8)
         << QApplication::translate("elektorSDR", "Left-Right", 0, QApplication::UnicodeUTF8)
        );
        fmDeemphasisSelector->clear();
        fmDeemphasisSelector->insertItems(0, QStringList()
         << QApplication::translate("elektorSDR", "50", 0, QApplication::UnicodeUTF8)
         << QApplication::translate("elektorSDR", "none", 0, QApplication::UnicodeUTF8)
         << QApplication::translate("elektorSDR", "75", 0, QApplication::UnicodeUTF8)
        );
        fmRdsSelector->clear();
        fmRdsSelector->insertItems(0, QStringList()
         << QApplication::translate("elektorSDR", "no rds", 0, QApplication::UnicodeUTF8)
         << QApplication::translate("elektorSDR", "rds 1", 0, QApplication::UnicodeUTF8)
         << QApplication::translate("elektorSDR", "rds 2", 0, QApplication::UnicodeUTF8)
        );
        rdsSyncLabel->setText(QString());
        speechLabel->setText(QString());
        pll_isLocked->setText(QApplication::translate("elektorSDR", "pilot", 0, QApplication::UnicodeUTF8));
        label_6->setText(QApplication::translate("elektorSDR", "PiCode", 0, QApplication::UnicodeUTF8));
        label_11->setText(QApplication::translate("elektorSDR", "AF", 0, QApplication::UnicodeUTF8));
        freqButton->setText(QApplication::translate("elektorSDR", "Freq", 0, QApplication::UnicodeUTF8));
        audioDump->setText(QApplication::translate("elektorSDR", "dump", 0, QApplication::UnicodeUTF8));
        minusOne->setText(QApplication::translate("elektorSDR", "-1", 0, QApplication::UnicodeUTF8));
        plusOne->setText(QApplication::translate("elektorSDR", "+1", 0, QApplication::UnicodeUTF8));
    } // retranslateUi

};

namespace Ui {
    class elektorSDR: public Ui_elektorSDR {};
} // namespace Ui

QT_END_NAMESPACE

#endif // UI_SDRGUI_H
